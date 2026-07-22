export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agreements: {
        Row: {
          agreement_type: string | null
          center: string
          contents: string[]
          created_at: string
          date: string
          file_data: string | null
          file_name: string | null
          id: number
          organizations: Json
          subject_org: string | null
          subject_univ: string
          unit_id: string
          year: number
        }
        Insert: {
          agreement_type?: string | null
          center: string
          contents: string[]
          created_at?: string
          date: string
          file_data?: string | null
          file_name?: string | null
          id?: number
          organizations: Json
          subject_org?: string | null
          subject_univ: string
          unit_id: string
          year: number
        }
        Update: {
          agreement_type?: string | null
          center?: string
          contents?: string[]
          created_at?: string
          date?: string
          file_data?: string | null
          file_name?: string | null
          id?: number
          organizations?: Json
          subject_org?: string | null
          subject_univ?: string
          unit_id?: string
          year?: number
        }
        Relationships: []
      }
      asset_equipments: {
        Row: {
          asset_number: string
          barcode: string
          category: string
          created_at: string
          id: string
          item_name: string
          memo: string | null
          stock_location: string
          usage_type: string
        }
        Insert: {
          asset_number: string
          barcode: string
          category: string
          created_at?: string
          id?: string
          item_name: string
          memo?: string | null
          stock_location: string
          usage_type: string
        }
        Update: {
          asset_number?: string
          barcode?: string
          category?: string
          created_at?: string
          id?: string
          item_name?: string
          memo?: string | null
          stock_location?: string
          usage_type?: string
        }
        Relationships: []
      }
      asset_reservations: {
        Row: {
          actual_user_name: string | null
          created_at: string
          custom_dept: string | null
          dept: string
          end_time: string
          id: string
          purpose: string | null
          reserved_date: string
          reserver_name: string
          space_name: string
          start_time: string
          status: string | null
        }
        Insert: {
          actual_user_name?: string | null
          created_at?: string
          custom_dept?: string | null
          dept: string
          end_time: string
          id?: string
          purpose?: string | null
          reserved_date: string
          reserver_name: string
          space_name: string
          start_time: string
          status?: string | null
        }
        Update: {
          actual_user_name?: string | null
          created_at?: string
          custom_dept?: string | null
          dept?: string
          end_time?: string
          id?: string
          purpose?: string | null
          reserved_date?: string
          reserver_name?: string
          space_name?: string
          start_time?: string
          status?: string | null
        }
        Relationships: []
      }
      budget_executions: {
        Row: {
          account_detail: string | null
          account_subject: string | null
          amount: number
          budget_type: string
          client: string | null
          created_at: string
          detail_usage: string | null
          enara_category: string | null
          execution_date: string | null
          expense_category: string | null
          funding_source: string
          id: string
          manager: string | null
          month_label: string
          program_id: string
          program_name: string
          resolution_no: string
          summary: string | null
          year: number
        }
        Insert: {
          account_detail?: string | null
          account_subject?: string | null
          amount?: number
          budget_type?: string
          client?: string | null
          created_at?: string
          detail_usage?: string | null
          enara_category?: string | null
          execution_date?: string | null
          expense_category?: string | null
          funding_source: string
          id?: string
          manager?: string | null
          month_label: string
          program_id: string
          program_name: string
          resolution_no: string
          summary?: string | null
          year: number
        }
        Update: {
          account_detail?: string | null
          account_subject?: string | null
          amount?: number
          budget_type?: string
          client?: string | null
          created_at?: string
          detail_usage?: string | null
          enara_category?: string | null
          execution_date?: string | null
          expense_category?: string | null
          funding_source?: string
          id?: string
          manager?: string | null
          month_label?: string
          program_id?: string
          program_name?: string
          resolution_no?: string
          summary?: string | null
          year?: number
        }
        Relationships: []
      }
      committee_meetings: {
        Row: {
          access_pin: string | null
          agenda: string
          attachment_data: string | null
          attachment_name: string | null
          committee_id: string
          created_at: string
          id: string
          meeting_date: string
          meeting_type: string
          status: string
          title: string
        }
        Insert: {
          access_pin?: string | null
          agenda: string
          attachment_data?: string | null
          attachment_name?: string | null
          committee_id: string
          created_at?: string
          id?: string
          meeting_date: string
          meeting_type?: string
          status?: string
          title: string
        }
        Update: {
          access_pin?: string | null
          agenda?: string
          attachment_data?: string | null
          attachment_name?: string | null
          committee_id?: string
          created_at?: string
          id?: string
          meeting_date?: string
          meeting_type?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "committee_meetings_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
        ]
      }
      committee_members: {
        Row: {
          committee_id: string | null
          created_at: string
          dept: string | null
          id: number
          location: string | null
          name: string
          note: string | null
          org: string | null
          rank: string | null
          sort_order: number | null
          term: string | null
          type: string | null
          year: string | null
        }
        Insert: {
          committee_id?: string | null
          created_at?: string
          dept?: string | null
          id?: number
          location?: string | null
          name: string
          note?: string | null
          org?: string | null
          rank?: string | null
          sort_order?: number | null
          term?: string | null
          type?: string | null
          year?: string | null
        }
        Update: {
          committee_id?: string | null
          created_at?: string
          dept?: string | null
          id?: number
          location?: string | null
          name?: string
          note?: string | null
          org?: string | null
          rank?: string | null
          sort_order?: number | null
          term?: string | null
          type?: string | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "committee_members_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
        ]
      }
      committees: {
        Row: {
          created_at: string
          id: string
          name: string
          total_quorum: number
          voting_rule: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          total_quorum?: number
          voting_rule?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          total_quorum?: number
          voting_rule?: string
        }
        Relationships: []
      }
      educational_videos: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          title: string
          video_id: string
          youtube_url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          video_id: string
          youtube_url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          video_id?: string
          youtube_url?: string
        }
        Relationships: []
      }
      equipment_assets: {
        Row: {
          asset_number: string
          barcode_id: string
          category: string | null
          created_at: string | null
          dept_name: string | null
          id: number
          item_name: string
          last_checked_at: string | null
          memo: string | null
          quantity: number | null
          stock_location: string | null
          unit_price: number | null
          usage_type: string | null
        }
        Insert: {
          asset_number: string
          barcode_id: string
          category?: string | null
          created_at?: string | null
          dept_name?: string | null
          id?: number
          item_name: string
          last_checked_at?: string | null
          memo?: string | null
          quantity?: number | null
          stock_location?: string | null
          unit_price?: number | null
          usage_type?: string | null
        }
        Update: {
          asset_number?: string
          barcode_id?: string
          category?: string | null
          created_at?: string | null
          dept_name?: string | null
          id?: number
          item_name?: string
          last_checked_at?: string | null
          memo?: string | null
          quantity?: number | null
          stock_location?: string | null
          unit_price?: number | null
          usage_type?: string | null
        }
        Relationships: []
      }
      equipment_utilization_records: {
        Row: {
          created_at: string
          equipment_id: number
          id: number
          semester: string
          usage_details: string
        }
        Insert: {
          created_at?: string
          equipment_id: number
          id?: number
          semester: string
          usage_details: string
        }
        Update: {
          created_at?: string
          equipment_id?: number
          id?: number
          semester?: string
          usage_details?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_utilization_records_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_histories: {
        Row: {
          amount: number
          created_at: string | null
          department: string
          id: string
          instructor_id: string
          is_internal: boolean
          position: string
          program_id: string
          year: number
        }
        Insert: {
          amount?: number
          created_at?: string | null
          department: string
          id?: string
          instructor_id: string
          is_internal?: boolean
          position: string
          program_id: string
          year?: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          department?: string
          id?: string
          instructor_id?: string
          is_internal?: boolean
          position?: string
          program_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "instructor_histories_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
        ]
      }
      instructors: {
        Row: {
          account_number: string
          bank_name: string
          birth_date: string
          created_at: string | null
          gender: string | null
          id: string
          name: string
        }
        Insert: {
          account_number: string
          bank_name: string
          birth_date: string
          created_at?: string | null
          gender?: string | null
          id?: string
          name: string
        }
        Update: {
          account_number?: string
          bank_name?: string
          birth_date?: string
          created_at?: string | null
          gender?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      meeting_agenda_votes: {
        Row: {
          agenda_id: string | null
          created_at: string
          id: string
          meeting_id: string | null
          member_id: number | null
          opinion: string | null
          score: number | null
          vote: string | null
        }
        Insert: {
          agenda_id?: string | null
          created_at?: string
          id?: string
          meeting_id?: string | null
          member_id?: number | null
          opinion?: string | null
          score?: number | null
          vote?: string | null
        }
        Update: {
          agenda_id?: string | null
          created_at?: string
          id?: string
          meeting_id?: string | null
          member_id?: number | null
          opinion?: string | null
          score?: number | null
          vote?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_agenda_votes_agenda_id_fkey"
            columns: ["agenda_id"]
            isOneToOne: false
            referencedRelation: "meeting_agendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_agenda_votes_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "committee_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_agenda_votes_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "committee_members"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_agendas: {
        Row: {
          attachment_data: string | null
          attachment_name: string | null
          created_at: string
          description: string | null
          id: string
          is_evaluation: boolean | null
          meeting_id: string | null
          sort_order: number | null
          title: string
        }
        Insert: {
          attachment_data?: string | null
          attachment_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_evaluation?: boolean | null
          meeting_id?: string | null
          sort_order?: number | null
          title: string
        }
        Update: {
          attachment_data?: string | null
          attachment_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_evaluation?: boolean | null
          meeting_id?: string | null
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_agendas_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "committee_meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_responses: {
        Row: {
          attended: boolean | null
          encrypted_signature: string | null
          id: string
          meeting_id: string | null
          member_id: number | null
          opinion: string | null
          submitted_at: string | null
          vote: string | null
        }
        Insert: {
          attended?: boolean | null
          encrypted_signature?: string | null
          id?: string
          meeting_id?: string | null
          member_id?: number | null
          opinion?: string | null
          submitted_at?: string | null
          vote?: string | null
        }
        Update: {
          attended?: boolean | null
          encrypted_signature?: string | null
          id?: string
          meeting_id?: string | null
          member_id?: number | null
          opinion?: string | null
          submitted_at?: string | null
          vote?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_responses_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "committee_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_responses_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "committee_members"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_results: {
        Row: {
          ai_summary: string | null
          created_at: string
          decision_status: string | null
          id: string
          is_established: boolean | null
          meeting_id: string | null
          official_minutes: string | null
          published_at: string | null
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          decision_status?: string | null
          id?: string
          is_established?: boolean | null
          meeting_id?: string | null
          official_minutes?: string | null
          published_at?: string | null
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          decision_status?: string | null
          id?: string
          is_established?: boolean | null
          meeting_id?: string | null
          official_minutes?: string | null
          published_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_results_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: true
            referencedRelation: "committee_meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      orderly_courses: {
        Row: {
          budget: number | null
          created_at: string
          dept: string
          id: string
          is_foreign: boolean | null
          name: string
          professor: string
          students: number | null
          type: string
          year: number | null
        }
        Insert: {
          budget?: number | null
          created_at?: string
          dept: string
          id: string
          is_foreign?: boolean | null
          name: string
          professor: string
          students?: number | null
          type: string
          year?: number | null
        }
        Update: {
          budget?: number | null
          created_at?: string
          dept?: string
          id?: string
          is_foreign?: boolean | null
          name?: string
          professor?: string
          students?: number | null
          type?: string
          year?: number | null
        }
        Relationships: []
      }
      orderly_courses_depts: {
        Row: {
          courses: string
          created_at: string
          dept: string
          id: number
          note: string | null
          pm_name: string
          total_students: number | null
          unique_students: number | null
        }
        Insert: {
          courses: string
          created_at?: string
          dept: string
          id?: number
          note?: string | null
          pm_name: string
          total_students?: number | null
          unique_students?: number | null
        }
        Update: {
          courses?: string
          created_at?: string
          dept?: string
          id?: number
          note?: string | null
          pm_name?: string
          total_students?: number | null
          unique_students?: number | null
        }
        Relationships: []
      }
      partner_institutions: {
        Row: {
          category: string
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          id: number
          location: string
          name: string
          remarks: string | null
          sectors: string[] | null
          sub_category: string | null
        }
        Insert: {
          category: string
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: number
          location: string
          name: string
          remarks?: string | null
          sectors?: string[] | null
          sub_category?: string | null
        }
        Update: {
          category?: string
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: number
          location?: string
          name?: string
          remarks?: string | null
          sectors?: string[] | null
          sub_category?: string | null
        }
        Relationships: []
      }
      portal_configs: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      press_releases: {
        Row: {
          broadcast_date: string
          content_url: string
          created_at: string
          id: number
          image_url: string | null
          media: string
          press_content: string | null
          title: string
          type: string
          year: number
        }
        Insert: {
          broadcast_date: string
          content_url: string
          created_at?: string
          id?: number
          image_url?: string | null
          media: string
          press_content?: string | null
          title: string
          type: string
          year: number
        }
        Update: {
          broadcast_date?: string
          content_url?: string
          created_at?: string
          id?: number
          image_url?: string | null
          media?: string
          press_content?: string | null
          title?: string
          type?: string
          year?: number
        }
        Relationships: []
      }
      procurement_env: {
        Row: {
          ai_bid_data: Json | null
          ai_proposal_data: Json | null
          ai_purchase_data: Json | null
          birdseye_view: string | null
          blueprints: string | null
          budget_plan: number
          budget_spent: number
          created_at: string
          created_by: string | null
          date_a: string | null
          date_b: string | null
          date_i: string | null
          date_p: string | null
          date_pr: string | null
          dept_name: string | null
          division_name: string | null
          doc_bid: string | null
          doc_bid_file_name: string | null
          doc_bid_file_size: number | null
          doc_bid_file_url: string | null
          doc_plan: string | null
          doc_plan_file_name: string | null
          doc_plan_file_size: number | null
          doc_plan_file_url: string | null
          doc_purchase: string | null
          doc_purchase_file_name: string | null
          doc_purchase_file_size: number | null
          doc_purchase_file_url: string | null
          id: number
          location: string | null
          meeting_result: string | null
          plan: string | null
          progress: string | null
          purpose: string | null
          related_docs: string | null
          title: string
          unit: string
          utilization: string | null
          year: number
        }
        Insert: {
          ai_bid_data?: Json | null
          ai_proposal_data?: Json | null
          ai_purchase_data?: Json | null
          birdseye_view?: string | null
          blueprints?: string | null
          budget_plan?: number
          budget_spent?: number
          created_at?: string
          created_by?: string | null
          date_a?: string | null
          date_b?: string | null
          date_i?: string | null
          date_p?: string | null
          date_pr?: string | null
          dept_name?: string | null
          division_name?: string | null
          doc_bid?: string | null
          doc_bid_file_name?: string | null
          doc_bid_file_size?: number | null
          doc_bid_file_url?: string | null
          doc_plan?: string | null
          doc_plan_file_name?: string | null
          doc_plan_file_size?: number | null
          doc_plan_file_url?: string | null
          doc_purchase?: string | null
          doc_purchase_file_name?: string | null
          doc_purchase_file_size?: number | null
          doc_purchase_file_url?: string | null
          id?: number
          location?: string | null
          meeting_result?: string | null
          plan?: string | null
          progress?: string | null
          purpose?: string | null
          related_docs?: string | null
          title: string
          unit: string
          utilization?: string | null
          year: number
        }
        Update: {
          ai_bid_data?: Json | null
          ai_proposal_data?: Json | null
          ai_purchase_data?: Json | null
          birdseye_view?: string | null
          blueprints?: string | null
          budget_plan?: number
          budget_spent?: number
          created_at?: string
          created_by?: string | null
          date_a?: string | null
          date_b?: string | null
          date_i?: string | null
          date_p?: string | null
          date_pr?: string | null
          dept_name?: string | null
          division_name?: string | null
          doc_bid?: string | null
          doc_bid_file_name?: string | null
          doc_bid_file_size?: number | null
          doc_bid_file_url?: string | null
          doc_plan?: string | null
          doc_plan_file_name?: string | null
          doc_plan_file_size?: number | null
          doc_plan_file_url?: string | null
          doc_purchase?: string | null
          doc_purchase_file_name?: string | null
          doc_purchase_file_size?: number | null
          doc_purchase_file_url?: string | null
          id?: number
          location?: string | null
          meeting_result?: string | null
          plan?: string | null
          progress?: string | null
          purpose?: string | null
          related_docs?: string | null
          title?: string
          unit?: string
          utilization?: string | null
          year?: number
        }
        Relationships: []
      }
      procurement_equipment: {
        Row: {
          asset_number: string | null
          barcode: string | null
          created_at: string
          created_by: string | null
          date_a: string | null
          date_b: string | null
          date_i: string | null
          date_p: string | null
          date_pr: string | null
          dept_name: string | null
          description: string | null
          division_name: string | null
          doc_bid: string | null
          doc_plan: string | null
          doc_purchase: string | null
          id: number
          item_name: string
          item_unit: string | null
          operation: string | null
          password: string | null
          quantity: number
          related_docs: string | null
          seq: number
          spec: string | null
          unit: string
          unit_price: number
          year: number
        }
        Insert: {
          asset_number?: string | null
          barcode?: string | null
          created_at?: string
          created_by?: string | null
          date_a?: string | null
          date_b?: string | null
          date_i?: string | null
          date_p?: string | null
          date_pr?: string | null
          dept_name?: string | null
          description?: string | null
          division_name?: string | null
          doc_bid?: string | null
          doc_plan?: string | null
          doc_purchase?: string | null
          id?: number
          item_name: string
          item_unit?: string | null
          operation?: string | null
          password?: string | null
          quantity?: number
          related_docs?: string | null
          seq?: number
          spec?: string | null
          unit: string
          unit_price?: number
          year: number
        }
        Update: {
          asset_number?: string | null
          barcode?: string | null
          created_at?: string
          created_by?: string | null
          date_a?: string | null
          date_b?: string | null
          date_i?: string | null
          date_p?: string | null
          date_pr?: string | null
          dept_name?: string | null
          description?: string | null
          division_name?: string | null
          doc_bid?: string | null
          doc_plan?: string | null
          doc_purchase?: string | null
          id?: number
          item_name?: string
          item_unit?: string | null
          operation?: string | null
          password?: string | null
          quantity?: number
          related_docs?: string | null
          seq?: number
          spec?: string | null
          unit?: string
          unit_price?: number
          year?: number
        }
        Relationships: []
      }
      procurement_services: {
        Row: {
          ai_bid_data: Json | null
          ai_proposal_data: Json | null
          ai_purchase_data: Json | null
          budget_plan: number
          budget_spent: number
          created_at: string
          created_by: string | null
          date_b: string | null
          date_c: string | null
          date_e: string | null
          date_es: string | null
          date_i: string | null
          date_pp: string | null
          date_rfo: string | null
          dept_name: string | null
          division_name: string | null
          doc_bid: string | null
          doc_bid_file_name: string | null
          doc_bid_file_size: number | null
          doc_bid_file_url: string | null
          doc_plan: string | null
          doc_plan_file_name: string | null
          doc_plan_file_size: number | null
          doc_plan_file_url: string | null
          doc_purchase: string | null
          doc_purchase_file_name: string | null
          doc_purchase_file_size: number | null
          doc_purchase_file_url: string | null
          id: number
          op_result: string | null
          password: string | null
          program_id: string | null
          program_name: string | null
          provider_qual: string | null
          purpose: string | null
          related_docs: string | null
          step: number
          title: string
          unit: string | null
          year: number
        }
        Insert: {
          ai_bid_data?: Json | null
          ai_proposal_data?: Json | null
          ai_purchase_data?: Json | null
          budget_plan?: number
          budget_spent?: number
          created_at?: string
          created_by?: string | null
          date_b?: string | null
          date_c?: string | null
          date_e?: string | null
          date_es?: string | null
          date_i?: string | null
          date_pp?: string | null
          date_rfo?: string | null
          dept_name?: string | null
          division_name?: string | null
          doc_bid?: string | null
          doc_bid_file_name?: string | null
          doc_bid_file_size?: number | null
          doc_bid_file_url?: string | null
          doc_plan?: string | null
          doc_plan_file_name?: string | null
          doc_plan_file_size?: number | null
          doc_plan_file_url?: string | null
          doc_purchase?: string | null
          doc_purchase_file_name?: string | null
          doc_purchase_file_size?: number | null
          doc_purchase_file_url?: string | null
          id?: number
          op_result?: string | null
          password?: string | null
          program_id?: string | null
          program_name?: string | null
          provider_qual?: string | null
          purpose?: string | null
          related_docs?: string | null
          step?: number
          title: string
          unit?: string | null
          year: number
        }
        Update: {
          ai_bid_data?: Json | null
          ai_proposal_data?: Json | null
          ai_purchase_data?: Json | null
          budget_plan?: number
          budget_spent?: number
          created_at?: string
          created_by?: string | null
          date_b?: string | null
          date_c?: string | null
          date_e?: string | null
          date_es?: string | null
          date_i?: string | null
          date_pp?: string | null
          date_rfo?: string | null
          dept_name?: string | null
          division_name?: string | null
          doc_bid?: string | null
          doc_bid_file_name?: string | null
          doc_bid_file_size?: number | null
          doc_bid_file_url?: string | null
          doc_plan?: string | null
          doc_plan_file_name?: string | null
          doc_plan_file_size?: number | null
          doc_plan_file_url?: string | null
          doc_purchase?: string | null
          doc_purchase_file_name?: string | null
          doc_purchase_file_size?: number | null
          doc_purchase_file_url?: string | null
          id?: number
          op_result?: string | null
          password?: string | null
          program_id?: string | null
          program_name?: string | null
          provider_qual?: string | null
          purpose?: string | null
          related_docs?: string | null
          step?: number
          title?: string
          unit?: string | null
          year?: number
        }
        Relationships: []
      }
      program_version_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          changes: Json
          id: number
          program_id: string
          program_title: string
          requested_at: string
          requested_by: string
          status: string
          unit_id: string
          version_name: string
          year: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          changes: Json
          id?: number
          program_id: string
          program_title: string
          requested_at?: string
          requested_by: string
          status?: string
          unit_id: string
          version_name: string
          year: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          changes?: Json
          id?: number
          program_id?: string
          program_title?: string
          requested_at?: string
          requested_by?: string
          status?: string
          unit_id?: string
          version_name?: string
          year?: number
        }
        Relationships: []
      }
      projects_data: {
        Row: {
          data: Json
          id: number
          updated_at: string
          year: number
        }
        Insert: {
          data: Json
          id?: number
          updated_at?: string
          year: number
        }
        Update: {
          data?: Json
          id?: number
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      rag_documents: {
        Row: {
          content: string
          created_at: string | null
          embedding: string
          id: number
          metadata: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding: string
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      rise_members: {
        Row: {
          created_at: string
          dept: string
          email: string | null
          endDate: string | null
          grade: string
          id: string
          name: string
          phoneMobile: string | null
          phoneOffice: string | null
          role: string
          room: string | null
          startDate: string | null
          status: string
        }
        Insert: {
          created_at?: string
          dept: string
          email?: string | null
          endDate?: string | null
          grade: string
          id: string
          name: string
          phoneMobile?: string | null
          phoneOffice?: string | null
          role: string
          room?: string | null
          startDate?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          dept?: string
          email?: string | null
          endDate?: string | null
          grade?: string
          id?: string
          name?: string
          phoneMobile?: string | null
          phoneOffice?: string | null
          role?: string
          room?: string | null
          startDate?: string | null
          status?: string
        }
        Relationships: []
      }
      rise_users: {
        Row: {
          approved: boolean
          created_at: string
          email: string | null
          id: string
          name: string
          pw: string
          role_key: string
          uuid: string | null
        }
        Insert: {
          approved?: boolean
          created_at?: string
          email?: string | null
          id: string
          name: string
          pw: string
          role_key: string
          uuid?: string | null
        }
        Update: {
          approved?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          pw?: string
          role_key?: string
          uuid?: string | null
        }
        Relationships: []
      }
      satisfaction_responses: {
        Row: {
          comments: string | null
          created_at: string | null
          id: string
          responder_info: string | null
          score_q1: number | null
          score_q2: number | null
          score_q3: number | null
          score_q4: number | null
          score_q5: number | null
          survey_id: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          id?: string
          responder_info?: string | null
          score_q1?: number | null
          score_q2?: number | null
          score_q3?: number | null
          score_q4?: number | null
          score_q5?: number | null
          survey_id?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          id?: string
          responder_info?: string | null
          score_q1?: number | null
          score_q2?: number | null
          score_q3?: number | null
          score_q4?: number | null
          score_q5?: number | null
          survey_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "satisfaction_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "satisfaction_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      satisfaction_surveys: {
        Row: {
          ai_report: string | null
          created_at: string | null
          department: string
          end_date: string
          google_sheet_url: string | null
          id: string
          purpose: string
          start_date: string
          status: string | null
          target: string
          title: string
        }
        Insert: {
          ai_report?: string | null
          created_at?: string | null
          department: string
          end_date: string
          google_sheet_url?: string | null
          id: string
          purpose: string
          start_date: string
          status?: string | null
          target: string
          title: string
        }
        Update: {
          ai_report?: string | null
          created_at?: string | null
          department?: string
          end_date?: string
          google_sheet_url?: string | null
          id?: string
          purpose?: string
          start_date?: string
          status?: string | null
          target?: string
          title?: string
        }
        Relationships: []
      }
      schedule_events: {
        Row: {
          attendees_external: string | null
          attendees_internal: string | null
          created_at: string
          datetime: string | null
          department: string | null
          id: number
          location: string | null
          month: number
          program: string | null
          purpose: string | null
          result: string | null
          title: string
          year: number
        }
        Insert: {
          attendees_external?: string | null
          attendees_internal?: string | null
          created_at?: string
          datetime?: string | null
          department?: string | null
          id?: number
          location?: string | null
          month: number
          program?: string | null
          purpose?: string | null
          result?: string | null
          title: string
          year: number
        }
        Update: {
          attendees_external?: string | null
          attendees_internal?: string | null
          created_at?: string
          datetime?: string | null
          department?: string | null
          id?: number
          location?: string | null
          month?: number
          program?: string | null
          purpose?: string | null
          result?: string | null
          title?: string
          year?: number
        }
        Relationships: []
      }
      schedule_meetings: {
        Row: {
          agenda: string | null
          attendees_external: string | null
          attendees_internal: string | null
          audio_url: string | null
          category: string
          created_at: string
          datetime: string | null
          id: number
          location: string | null
          month: number
          pdf_url: string | null
          result: string | null
          title: string
          year: number
        }
        Insert: {
          agenda?: string | null
          attendees_external?: string | null
          attendees_internal?: string | null
          audio_url?: string | null
          category: string
          created_at?: string
          datetime?: string | null
          id?: number
          location?: string | null
          month: number
          pdf_url?: string | null
          result?: string | null
          title: string
          year: number
        }
        Update: {
          agenda?: string | null
          attendees_external?: string | null
          attendees_internal?: string | null
          audio_url?: string | null
          category?: string
          created_at?: string
          datetime?: string | null
          id?: number
          location?: string | null
          month?: number
          pdf_url?: string | null
          result?: string | null
          title?: string
          year?: number
        }
        Relationships: []
      }
      schedule_monthly: {
        Row: {
          attendees: string | null
          completed: boolean
          created_at: string
          dept: string
          end_at: string
          event_id: number | null
          id: number
          is_deadline: boolean
          is_task: boolean
          location: string | null
          meeting_id: number | null
          start_at: string
          title: string
          type: string
          year: number
        }
        Insert: {
          attendees?: string | null
          completed?: boolean
          created_at?: string
          dept: string
          end_at: string
          event_id?: number | null
          id?: number
          is_deadline?: boolean
          is_task?: boolean
          location?: string | null
          meeting_id?: number | null
          start_at: string
          title: string
          type: string
          year: number
        }
        Update: {
          attendees?: string | null
          completed?: boolean
          created_at?: string
          dept?: string
          end_at?: string
          event_id?: number | null
          id?: number
          is_deadline?: boolean
          is_task?: boolean
          location?: string | null
          meeting_id?: number | null
          start_at?: string
          title?: string
          type?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "schedule_monthly_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "schedule_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_monthly_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "schedule_meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          account_holder: string | null
          account_num: string | null
          amount: string | null
          approval_date: string | null
          bank_name: string | null
          course: string | null
          created_at: string | null
          dept: string | null
          enroll_status: string | null
          grade: string | null
          id: number
          major: string | null
          name: string | null
          reg_status: string | null
          resident_id: string | null
          student_id: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          account_holder?: string | null
          account_num?: string | null
          amount?: string | null
          approval_date?: string | null
          bank_name?: string | null
          course?: string | null
          created_at?: string | null
          dept?: string | null
          enroll_status?: string | null
          grade?: string | null
          id?: number
          major?: string | null
          name?: string | null
          reg_status?: string | null
          resident_id?: string | null
          student_id?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          account_holder?: string | null
          account_num?: string | null
          amount?: string | null
          approval_date?: string | null
          bank_name?: string | null
          course?: string | null
          created_at?: string | null
          dept?: string | null
          enroll_status?: string | null
          grade?: string | null
          id?: number
          major?: string | null
          name?: string | null
          reg_status?: string | null
          resident_id?: string | null
          student_id?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: []
      }
      seminar_reports: {
        Row: {
          attendees: number
          carry_cost: number
          created_at: string
          date: string
          etc: string | null
          id: number
          main_cost: number
          satisfaction: number
          seminar_id: number
          speaker: string
          title: string
        }
        Insert: {
          attendees?: number
          carry_cost?: number
          created_at?: string
          date: string
          etc?: string | null
          id?: number
          main_cost?: number
          satisfaction?: number
          seminar_id: number
          speaker: string
          title: string
        }
        Update: {
          attendees?: number
          carry_cost?: number
          created_at?: string
          date?: string
          etc?: string | null
          id?: number
          main_cost?: number
          satisfaction?: number
          seminar_id?: number
          speaker?: string
          title?: string
        }
        Relationships: []
      }
      unified_certificates: {
        Row: {
          award_type: string | null
          birth_date: string | null
          cert_no: string | null
          cert_type: string
          content: string | null
          created_at: string
          file_data: string | null
          file_name: string | null
          id: number
          issue_date: string | null
          issuer: string | null
          manager_dept: string | null
          manager_name: string | null
          note: string | null
          phone: string | null
          project_group: string | null
          recipient_name: string
          student_id: string | null
          team_name: string | null
          year: number
        }
        Insert: {
          award_type?: string | null
          birth_date?: string | null
          cert_no?: string | null
          cert_type: string
          content?: string | null
          created_at?: string
          file_data?: string | null
          file_name?: string | null
          id?: number
          issue_date?: string | null
          issuer?: string | null
          manager_dept?: string | null
          manager_name?: string | null
          note?: string | null
          phone?: string | null
          project_group?: string | null
          recipient_name: string
          student_id?: string | null
          team_name?: string | null
          year: number
        }
        Update: {
          award_type?: string | null
          birth_date?: string | null
          cert_no?: string | null
          cert_type?: string
          content?: string | null
          created_at?: string
          file_data?: string | null
          file_name?: string | null
          id?: number
          issue_date?: string | null
          issuer?: string | null
          manager_dept?: string | null
          manager_name?: string | null
          note?: string | null
          phone?: string | null
          project_group?: string | null
          recipient_name?: string
          student_id?: string | null
          team_name?: string | null
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      scholarships_view: {
        Row: {
          account_holder: string | null
          account_num: string | null
          amount: string | null
          approval_date: string | null
          bank_name: string | null
          course: string | null
          created_at: string | null
          dept: string | null
          enroll_status: string | null
          grade: string | null
          id: number | null
          major: string | null
          name: string | null
          reg_status: string | null
          resident_id: string | null
          student_id: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          account_holder?: string | null
          account_num?: never
          amount?: string | null
          approval_date?: string | null
          bank_name?: string | null
          course?: string | null
          created_at?: string | null
          dept?: string | null
          enroll_status?: string | null
          grade?: string | null
          id?: number | null
          major?: string | null
          name?: string | null
          reg_status?: string | null
          resident_id?: never
          student_id?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          account_holder?: string | null
          account_num?: never
          amount?: string | null
          approval_date?: string | null
          bank_name?: string | null
          course?: string | null
          created_at?: string | null
          dept?: string | null
          enroll_status?: string | null
          grade?: string | null
          id?: number | null
          major?: string | null
          name?: string | null
          reg_status?: string | null
          resident_id?: never
          student_id?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      decrypt_sensitive_data: {
        Args: { encrypted_data: string; encryption_key: string }
        Returns: string
      }
      encrypt_sensitive_data: {
        Args: { encryption_key: string; plain_text: string }
        Returns: string
      }
      match_rag_documents: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      reset_all_member_passwords_v2: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
