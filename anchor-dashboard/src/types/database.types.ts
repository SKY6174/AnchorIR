/**
 * 💡 Supabase 데이터베이스 스키마 자동 매핑 타입 정의 (Database Types)
 * 
 * 본 파일은 Supabase PostgreSQL 테이블의 데이터 구조를 TypeScript 타입으로 매핑한 정의 파일입니다.
 * 런타임 데이터의 형태를 컴파일 단계에서 엄격히 검증하여 오타 및 데이터 유실을 방지합니다.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      /** 위원회 마스터 테이블 */
      committees: {
        Row: {
          id: string;
          name: string;
          total_quorum: number;
          voting_rule: 'majority_of_total' | 'majority_of_attendees';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          total_quorum?: number;
          voting_rule?: 'majority_of_total' | 'majority_of_attendees';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          total_quorum?: number;
          voting_rule?: 'majority_of_total' | 'majority_of_attendees';
          created_at?: string;
        };
      };

      /** 위원회 구성원 테이블 */
      committee_members: {
        Row: {
          id: string;
          committee_id: string;
          user_id: string;
          role: 'CHAIRMAN' | 'SECRETARY' | 'MEMBER';
          term_start: string | null;
          term_end: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          committee_id: string;
          user_id: string;
          role?: 'CHAIRMAN' | 'SECRETARY' | 'MEMBER';
          term_start?: string | null;
          term_end?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          committee_id?: string;
          user_id?: string;
          role?: 'CHAIRMAN' | 'SECRETARY' | 'MEMBER';
          term_start?: string | null;
          term_end?: string | null;
          created_at?: string;
        };
      };

      /** 회의 생성 및 안건 관리 테이블 */
      committee_meetings: {
        Row: {
          id: string;
          committee_id: string;
          title: string;
          meeting_date: string;
          meeting_type: 'OFFLINE_FACE' | 'ONLINE_WRITTEN';
          agenda: string;
          status: 'CREATED' | 'ACTIVE' | 'CLOSED' | 'REPORTED';
          created_at: string;
        };
        Insert: {
          id?: string;
          committee_id: string;
          title: string;
          meeting_date: string;
          meeting_type?: 'OFFLINE_FACE' | 'ONLINE_WRITTEN';
          agenda: string;
          status?: 'CREATED' | 'ACTIVE' | 'CLOSED' | 'REPORTED';
          created_at?: string;
        };
        Update: {
          id?: string;
          committee_id?: string;
          title?: string;
          meeting_date?: string;
          meeting_type?: 'OFFLINE_FACE' | 'ONLINE_WRITTEN';
          agenda?: string;
          status?: 'CREATED' | 'ACTIVE' | 'CLOSED' | 'REPORTED';
          created_at?: string;
        };
      };

      /** 참석 및 표결 결과 테이블 */
      meeting_responses: {
        Row: {
          id: string;
          meeting_id: string;
          member_id: string;
          attended: boolean;
          vote: 'APPROVE' | 'REJECT' | 'ABSTAIN' | null;
          opinion: string | null;
          encrypted_signature: string | null;
          submitted_at: string | null;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          member_id: string;
          attended?: boolean;
          vote?: 'APPROVE' | 'REJECT' | 'ABSTAIN' | null;
          opinion?: string | null;
          encrypted_signature?: string | null;
          submitted_at?: string | null;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          member_id?: string;
          attended?: boolean;
          vote?: 'APPROVE' | 'REJECT' | 'ABSTAIN' | null;
          opinion?: string | null;
          encrypted_signature?: string | null;
          submitted_at?: string | null;
        };
      };

      /** 최종 회의 결과 및 AI 요약 보고서 테이블 */
      meeting_results: {
        Row: {
          id: string;
          meeting_id: string;
          is_established: boolean;
          decision_status: 'APPROVED' | 'REJECTED' | 'CANCELLED_NO_QUORUM' | 'PENDING';
          ai_summary: string | null;
          official_minutes: string | null;
          published_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          is_established?: boolean;
          decision_status?: 'APPROVED' | 'REJECTED' | 'CANCELLED_NO_QUORUM' | 'PENDING';
          ai_summary?: string | null;
          official_minutes?: string | null;
          published_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          is_established?: boolean;
          decision_status?: 'APPROVED' | 'REJECTED' | 'CANCELLED_NO_QUORUM' | 'PENDING';
          ai_summary?: string | null;
          official_minutes?: string | null;
          published_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
