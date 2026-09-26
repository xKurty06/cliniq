# Entity-Relationship Diagram

**Status: first draft, built from already-documented requirements — not waiting on an external SRS upload.** Every entity below comes directly from the Frontend Context Brief's "Data Entities" section (§5); every relationship is a direct, necessary consequence of behavior already described elsewhere (Modules & Features, the interaction flows). Two things are genuine **design decisions made here, not previously specified**, flagged so they get reviewed rather than assumed final:

1. **`ParentNotification` and `InventoryTransaction` are split into their own tables**, not stored as arrays/logs on their parent record. The source docs describe these as "a log" or "an array of attempts" conceptually — turning that into a proper one-to-many relationship is the standard relational translation, but it's a schema-level choice, not something explicitly dictated before now.
2. **Column types/lengths are reasonable defaults** (e.g., `VARCHAR(10)` for `student_number`), not values anyone specified — adjust freely once real backend work starts.

## Diagram

```mermaid
erDiagram
    STUDENT ||--o{ VISIT : "has"
    STUDENT ||--o{ INCIDENT : "has"
    STUDENT ||--o{ FOLLOW_UP : "has"

    USER ||--o{ VISIT : "logs"
    USER ||--o{ INCIDENT : "logs"
    USER ||--o{ FOLLOW_UP : "creates"
    USER ||--o{ INVENTORY_TRANSACTION : "performs"
    USER ||--o{ AUDIT_LOG_ENTRY : "generates"
    USER ||--o{ REPORT : "generates"
    USER ||--o{ BACKUP_LOG : "verifies"

    VISIT ||--o| FOLLOW_UP : "may generate"
    INCIDENT ||--o| FOLLOW_UP : "may generate"
    INCIDENT ||--o{ PARENT_NOTIFICATION : "has attempts"

    INVENTORY_ITEM ||--o{ INVENTORY_TRANSACTION : "has"
    VISIT ||--o{ INVENTORY_TRANSACTION : "may link to"

    STUDENT {
        int id PK
        string student_number "YYYY-NNNNN, unique, system-generated"
        string full_name
        string grade_level
        string section
        date date_of_birth
        string gender
        string contact_info
        string emergency_contact_name
        string emergency_contact_number
        text allergies
        text medical_conditions
        boolean record_complete_flag
        boolean archived_flag
        datetime created_at
        datetime updated_at
    }

    USER {
        int id PK
        string name
        string username UK
        string password_hash
        enum role "staff / admin / instructor"
        datetime last_login
        datetime created_at
    }

    VISIT {
        int id PK
        int student_id FK
        int staff_id FK
        datetime visit_datetime
        string complaint
        text treatment
        enum disposition "returned_to_class / sent_home / referred_to_hospital"
        string event_tag "optional free text, e.g. MCA Dance Program"
        int follow_up_id FK "nullable"
    }

    INCIDENT {
        int id PK
        int student_id FK
        int staff_id FK
        datetime incident_datetime
        string complaint
        text vitals
        tinyint stage "1=fast-capture, 2=complete"
        string hospital_destination "nullable"
        string hospital_transport "nullable"
        datetime hospital_departure "nullable"
        string event_tag "optional"
        int follow_up_id FK "nullable"
    }

    PARENT_NOTIFICATION {
        int id PK
        int incident_id FK
        datetime attempt_datetime
        enum outcome "reached / not_reached / voicemail / left_message"
    }

    FOLLOW_UP {
        int id PK
        int student_id FK
        enum related_record_type "visit / incident"
        int related_record_id
        date follow_up_date
        string reason
        enum status "pending / completed / missed / cancelled"
        text notes
        int created_by FK "User"
    }

    INVENTORY_ITEM {
        int id PK
        string name
        enum category "medicine / supply"
        int current_stock
        string unit
        date expiration_date
        int low_stock_threshold
    }

    INVENTORY_TRANSACTION {
        int id PK
        int inventory_item_id FK
        int staff_id FK
        enum type "dispense / restock"
        int quantity
        int related_visit_id FK "nullable"
        datetime transaction_datetime
    }

    REPORT {
        int id PK
        enum type "monthly / incident / health_summary"
        date range_start
        date range_end
        int generated_by FK "User"
        datetime generated_at
    }

    BACKUP_LOG {
        int id PK
        datetime run_timestamp
        bigint file_size_bytes
        enum status "ok / failed"
        int verified_by FK "nullable, User"
    }

    AUDIT_LOG_ENTRY {
        int id PK
        int user_id FK
        enum action_type "login / scan / submit / approve / create / update / delete / archive"
        string target_type
        int target_id
        datetime timestamp
    }
```

## Notes for whoever writes the actual migrations

- `student_number`'s uniqueness and format (`YYYY-NNNNN`, sequence resets yearly) should be enforced at the application layer at generation time, not just a DB unique constraint — the format itself isn't something MySQL validates natively.
- `VISIT.follow_up_id` and `INCIDENT.follow_up_id` being nullable FKs (rather than `FOLLOW_UP` holding two nullable FKs back to each) reflects that a visit/incident either has a follow-up or doesn't — pick whichever direction is cleaner once an ORM is in play; Eloquent handles either.
- `AUDIT_LOG_ENTRY.target_type` + `target_id` is a simple polymorphic-style reference (any record type, not a dedicated FK per table) — matches Laravel's own polymorphic relations pattern if that's the implementation approach chosen.
- Nothing here is blocked on the SRS anymore — this **is** the first draft of that artifact, built from what the project already committed to.
