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
      amount: {
        Row: {
          sum: number | null;
        };
        Insert: {
          sum?: number | null;
        };
        Update: {
          sum?: number | null;
        };
        Relationships: [];
      };
      banks: {
        Row: {
          code: string;
          created_at: string;
          id: number;
          name: string;
          name_mn: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: number;
          name: string;
          name_mn: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: number;
          name?: string;
          name_mn?: string;
        };
        Relationships: [];
      };
      batch_job_execution: {
        Row: {
          create_time: string;
          end_time: string | null;
          exit_code: string | null;
          exit_message: string | null;
          job_execution_id: number;
          job_instance_id: number;
          last_updated: string | null;
          start_time: string | null;
          status: string | null;
          version: number | null;
        };
        Insert: {
          create_time: string;
          end_time?: string | null;
          exit_code?: string | null;
          exit_message?: string | null;
          job_execution_id: number;
          job_instance_id: number;
          last_updated?: string | null;
          start_time?: string | null;
          status?: string | null;
          version?: number | null;
        };
        Update: {
          create_time?: string;
          end_time?: string | null;
          exit_code?: string | null;
          exit_message?: string | null;
          job_execution_id?: number;
          job_instance_id?: number;
          last_updated?: string | null;
          start_time?: string | null;
          status?: string | null;
          version?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'job_inst_exec_fk';
            columns: ['job_instance_id'];
            referencedRelation: 'batch_job_instance';
            referencedColumns: ['job_instance_id'];
          }
        ];
      };
      batch_job_execution_context: {
        Row: {
          job_execution_id: number;
          serialized_context: string | null;
          short_context: string;
        };
        Insert: {
          job_execution_id: number;
          serialized_context?: string | null;
          short_context: string;
        };
        Update: {
          job_execution_id?: number;
          serialized_context?: string | null;
          short_context?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'job_exec_ctx_fk';
            columns: ['job_execution_id'];
            referencedRelation: 'batch_job_execution';
            referencedColumns: ['job_execution_id'];
          }
        ];
      };
      batch_job_execution_params: {
        Row: {
          identifying: string;
          job_execution_id: number;
          parameter_name: string;
          parameter_type: string;
          parameter_value: string | null;
        };
        Insert: {
          identifying: string;
          job_execution_id: number;
          parameter_name: string;
          parameter_type: string;
          parameter_value?: string | null;
        };
        Update: {
          identifying?: string;
          job_execution_id?: number;
          parameter_name?: string;
          parameter_type?: string;
          parameter_value?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'job_exec_params_fk';
            columns: ['job_execution_id'];
            referencedRelation: 'batch_job_execution';
            referencedColumns: ['job_execution_id'];
          }
        ];
      };
      batch_job_instance: {
        Row: {
          job_instance_id: number;
          job_key: string;
          job_name: string;
          version: number | null;
        };
        Insert: {
          job_instance_id: number;
          job_key: string;
          job_name: string;
          version?: number | null;
        };
        Update: {
          job_instance_id?: number;
          job_key?: string;
          job_name?: string;
          version?: number | null;
        };
        Relationships: [];
      };
      batch_step_execution: {
        Row: {
          commit_count: number | null;
          create_time: string;
          end_time: string | null;
          exit_code: string | null;
          exit_message: string | null;
          filter_count: number | null;
          job_execution_id: number;
          last_updated: string | null;
          process_skip_count: number | null;
          read_count: number | null;
          read_skip_count: number | null;
          rollback_count: number | null;
          start_time: string | null;
          status: string | null;
          step_execution_id: number;
          step_name: string;
          version: number;
          write_count: number | null;
          write_skip_count: number | null;
        };
        Insert: {
          commit_count?: number | null;
          create_time: string;
          end_time?: string | null;
          exit_code?: string | null;
          exit_message?: string | null;
          filter_count?: number | null;
          job_execution_id: number;
          last_updated?: string | null;
          process_skip_count?: number | null;
          read_count?: number | null;
          read_skip_count?: number | null;
          rollback_count?: number | null;
          start_time?: string | null;
          status?: string | null;
          step_execution_id: number;
          step_name: string;
          version: number;
          write_count?: number | null;
          write_skip_count?: number | null;
        };
        Update: {
          commit_count?: number | null;
          create_time?: string;
          end_time?: string | null;
          exit_code?: string | null;
          exit_message?: string | null;
          filter_count?: number | null;
          job_execution_id?: number;
          last_updated?: string | null;
          process_skip_count?: number | null;
          read_count?: number | null;
          read_skip_count?: number | null;
          rollback_count?: number | null;
          start_time?: string | null;
          status?: string | null;
          step_execution_id?: number;
          step_name?: string;
          version?: number;
          write_count?: number | null;
          write_skip_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'job_exec_step_fk';
            columns: ['job_execution_id'];
            referencedRelation: 'batch_job_execution';
            referencedColumns: ['job_execution_id'];
          }
        ];
      };
      batch_step_execution_context: {
        Row: {
          serialized_context: string | null;
          short_context: string;
          step_execution_id: number;
        };
        Insert: {
          serialized_context?: string | null;
          short_context: string;
          step_execution_id: number;
        };
        Update: {
          serialized_context?: string | null;
          short_context?: string;
          step_execution_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'step_exec_ctx_fk';
            columns: ['step_execution_id'];
            referencedRelation: 'batch_step_execution';
            referencedColumns: ['step_execution_id'];
          }
        ];
      };
      branches: {
        Row: {
          addr: string | null;
          bank_acc_name: string | null;
          bank_account: string | null;
          bank_code: string | null;
          city_id: number | null;
          created_at: string;
          created_by: string | null;
          district_id: number | null;
          email: string | null;
          id: number;
          merchant_id: number | null;
          name: string | null;
          phone: string | null;
          product_id: number | null;
        };
        Insert: {
          addr?: string | null;
          bank_acc_name?: string | null;
          bank_account?: string | null;
          bank_code?: string | null;
          city_id?: number | null;
          created_at?: string;
          created_by?: string | null;
          district_id?: number | null;
          email?: string | null;
          id?: number;
          merchant_id?: number | null;
          name?: string | null;
          phone?: string | null;
          product_id?: number | null;
        };
        Update: {
          addr?: string | null;
          bank_acc_name?: string | null;
          bank_account?: string | null;
          bank_code?: string | null;
          city_id?: number | null;
          created_at?: string;
          created_by?: string | null;
          district_id?: number | null;
          email?: string | null;
          id?: number;
          merchant_id?: number | null;
          name?: string | null;
          phone?: string | null;
          product_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'branches_city_id_fkey';
            columns: ['city_id'];
            referencedRelation: 'cities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'branches_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'branches_district_id_fkey';
            columns: ['district_id'];
            referencedRelation: 'districts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'branches_merchant_id_fkey';
            columns: ['merchant_id'];
            referencedRelation: 'merchants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'merchant_branch_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          }
        ];
      };
      cities: {
        Row: {
          id: number;
          name: string | null;
        };
        Insert: {
          id?: number;
          name?: string | null;
        };
        Update: {
          id?: number;
          name?: string | null;
        };
        Relationships: [];
      };
      dictionaries: {
        Row: {
          column_name: string | null;
          column_value: string | null;
          created_at: string;
          display_value: string | null;
          id: number;
          table_name: string | null;
        };
        Insert: {
          column_name?: string | null;
          column_value?: string | null;
          created_at?: string;
          display_value?: string | null;
          id?: number;
          table_name?: string | null;
        };
        Update: {
          column_name?: string | null;
          column_value?: string | null;
          created_at?: string;
          display_value?: string | null;
          id?: number;
          table_name?: string | null;
        };
        Relationships: [];
      };
      districts: {
        Row: {
          city_id: number | null;
          id: number;
          name: string | null;
        };
        Insert: {
          city_id?: number | null;
          id?: number;
          name?: string | null;
        };
        Update: {
          city_id?: number | null;
          id?: number;
          name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'districts_fk';
            columns: ['city_id'];
            referencedRelation: 'cities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_districts_city';
            columns: ['city_id'];
            referencedRelation: 'cities';
            referencedColumns: ['id'];
          }
        ];
      };
      invoices: {
        Row: {
          amount: number | null;
          created_at: string;
          created_by: string | null;
          id: number;
          lender_id: number | null;
          merchant_branch_id: number | null;
          product_id: number | null;
          qr_data: string | null;
          qr_type: string | null;
          status: string | null;
        };
        Insert: {
          amount?: number | null;
          created_at?: string;
          created_by?: string | null;
          id?: number;
          lender_id?: number | null;
          merchant_branch_id?: number | null;
          product_id?: number | null;
          qr_data?: string | null;
          qr_type?: string | null;
          status?: string | null;
        };
        Update: {
          amount?: number | null;
          created_at?: string;
          created_by?: string | null;
          id?: number;
          lender_id?: number | null;
          merchant_branch_id?: number | null;
          product_id?: number | null;
          qr_data?: string | null;
          qr_type?: string | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'invoices_lender_id_fkey';
            columns: ['lender_id'];
            referencedRelation: 'lenders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoices_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          }
        ];
      };
      lender_merchant: {
        Row: {
          acquire_fee: number | null;
          created_at: string;
          created_by: string | null;
          id: number;
          lender_id: number | null;
          merchant_branch_id: number | null;
        };
        Insert: {
          acquire_fee?: number | null;
          created_at?: string;
          created_by?: string | null;
          id?: number;
          lender_id?: number | null;
          merchant_branch_id?: number | null;
        };
        Update: {
          acquire_fee?: number | null;
          created_at?: string;
          created_by?: string | null;
          id?: number;
          lender_id?: number | null;
          merchant_branch_id?: number | null;
        };
        Relationships: [];
      };
      lender_user: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: number;
          lender_id: number | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: number;
          lender_id?: number | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: number;
          lender_id?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'lender_user_lender_id_fkey';
            columns: ['lender_id'];
            referencedRelation: 'lenders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lender_user_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          }
        ];
      };
      lenders: {
        Row: {
          addr: string | null;
          city_id: number | null;
          created_at: string;
          created_by: string | null;
          district_id: number | null;
          email: string | null;
          id: number;
          id_number: string | null;
          name: string | null;
          phone: string | null;
          status: string | null;
        };
        Insert: {
          addr?: string | null;
          city_id?: number | null;
          created_at?: string;
          created_by?: string | null;
          district_id?: number | null;
          email?: string | null;
          id?: number;
          id_number?: string | null;
          name?: string | null;
          phone?: string | null;
          status?: string | null;
        };
        Update: {
          addr?: string | null;
          city_id?: number | null;
          created_at?: string;
          created_by?: string | null;
          district_id?: number | null;
          email?: string | null;
          id?: number;
          id_number?: string | null;
          name?: string | null;
          phone?: string | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'lenders_city_id_fkey';
            columns: ['city_id'];
            referencedRelation: 'cities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lenders_created_by_fk';
            columns: ['created_by'];
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'lenders_district_id_fkey';
            columns: ['district_id'];
            referencedRelation: 'districts';
            referencedColumns: ['id'];
          }
        ];
      };
      merchant_branch_user: {
        Row: {
          created_at: string;
          id: number;
          merchant_branch_id: number | null;
          merchant_id: number | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          merchant_branch_id?: number | null;
          merchant_id?: number | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          merchant_branch_id?: number | null;
          merchant_id?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'merchant_branch_user_merchant_branch_id_fkey';
            columns: ['merchant_branch_id'];
            referencedRelation: 'branches';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'merchant_branch_user_merchant_id_fkey';
            columns: ['merchant_id'];
            referencedRelation: 'merchants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'merchant_branch_user_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          }
        ];
      };
      merchant_settlements: {
        Row: {
          created_at: string;
          id: number;
          total_amount: number | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          total_amount?: number | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          total_amount?: number | null;
        };
        Relationships: [];
      };
      merchant_user: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: number;
          merchant_id: number | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: number;
          merchant_id?: number | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: number;
          merchant_id?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'merchant_user_merchant_id_fkey';
            columns: ['merchant_id'];
            referencedRelation: 'merchants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'merchant_user_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          }
        ];
      };
      merchants: {
        Row: {
          addr: string | null;
          city_id: number | null;
          created_at: string;
          created_by: string | null;
          district_id: number | null;
          email: string | null;
          id: number;
          id_number: string | null;
          lender_id: number | null;
          name: string;
          phone: string | null;
          product_id: number | null;
          status: string | null;
        };
        Insert: {
          addr?: string | null;
          city_id?: number | null;
          created_at?: string;
          created_by?: string | null;
          district_id?: number | null;
          email?: string | null;
          id?: number;
          id_number?: string | null;
          lender_id?: number | null;
          name: string;
          phone?: string | null;
          product_id?: number | null;
          status?: string | null;
        };
        Update: {
          addr?: string | null;
          city_id?: number | null;
          created_at?: string;
          created_by?: string | null;
          district_id?: number | null;
          email?: string | null;
          id?: number;
          id_number?: string | null;
          lender_id?: number | null;
          name?: string;
          phone?: string | null;
          product_id?: number | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'merchants_city_id_fkey';
            columns: ['city_id'];
            referencedRelation: 'cities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'merchants_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'merchants_district_id_fkey';
            columns: ['district_id'];
            referencedRelation: 'districts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'merchants_lender_id_fkey';
            columns: ['lender_id'];
            referencedRelation: 'lenders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'merchants_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          }
        ];
      };
      payment_invoices: {
        Row: {
          acquirer_amount: number | null;
          amount: number | null;
          base_fee_amount: number | null;
          buyer_fname: string | null;
          buyer_id_number: string | null;
          buyer_lname: string | null;
          buyer_phone: string | null;
          created_at: string;
          created_by: string | null;
          fee_amount: number | null;
          id: number;
          invoice_id: number | null;
          issuer_amount: number | null;
          issuer_lender_id: number | null;
          job_id: number | null;
          lender_id: number | null;
          lender_settlement_id: number | null;
          merchant_amount: number | null;
          merchant_branch_id: number | null;
          merchant_id: number | null;
          merchant_settlement_id: number | null;
          product_id: number | null;
          qr_data: string | null;
          qr_type: string | null;
          status: string | null;
        };
        Insert: {
          acquirer_amount?: number | null;
          amount?: number | null;
          base_fee_amount?: number | null;
          buyer_fname?: string | null;
          buyer_id_number?: string | null;
          buyer_lname?: string | null;
          buyer_phone?: string | null;
          created_at?: string;
          created_by?: string | null;
          fee_amount?: number | null;
          id?: number;
          invoice_id?: number | null;
          issuer_amount?: number | null;
          issuer_lender_id?: number | null;
          job_id?: number | null;
          lender_id?: number | null;
          lender_settlement_id?: number | null;
          merchant_amount?: number | null;
          merchant_branch_id?: number | null;
          merchant_id?: number | null;
          merchant_settlement_id?: number | null;
          product_id?: number | null;
          qr_data?: string | null;
          qr_type?: string | null;
          status?: string | null;
        };
        Update: {
          acquirer_amount?: number | null;
          amount?: number | null;
          base_fee_amount?: number | null;
          buyer_fname?: string | null;
          buyer_id_number?: string | null;
          buyer_lname?: string | null;
          buyer_phone?: string | null;
          created_at?: string;
          created_by?: string | null;
          fee_amount?: number | null;
          id?: number;
          invoice_id?: number | null;
          issuer_amount?: number | null;
          issuer_lender_id?: number | null;
          job_id?: number | null;
          lender_id?: number | null;
          lender_settlement_id?: number | null;
          merchant_amount?: number | null;
          merchant_branch_id?: number | null;
          merchant_id?: number | null;
          merchant_settlement_id?: number | null;
          product_id?: number | null;
          qr_data?: string | null;
          qr_type?: string | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_invoices_invoice_id_fkey';
            columns: ['invoice_id'];
            referencedRelation: 'invoices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payment_invoices_lender_settlement_id_fkey';
            columns: ['lender_settlement_id'];
            referencedRelation: 'payment_settlements';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payment_invoices_lender_settlement_id_fkey';
            columns: ['lender_settlement_id'];
            referencedRelation: 'settlement_list';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payment_invoices_merchant_branch_id_fkey';
            columns: ['merchant_branch_id'];
            referencedRelation: 'branches';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payment_invoices_merchant_id_fkey';
            columns: ['merchant_id'];
            referencedRelation: 'merchants';
            referencedColumns: ['id'];
          }
        ];
      };
      payment_settlements: {
        Row: {
          acquirer_amount: number | null;
          base_fee_amount: number | null;
          created_at: string;
          created_by: string | null;
          fee_amount: number | null;
          id: number;
          issuer_amount: number | null;
          issuer_lender_id: number | null;
          job_id: number | null;
          lender_id: number | null;
          merchant_amount: number | null;
          merchant_branch_id: number | null;
          merchant_id: number | null;
          settlement_type: string | null;
          status: string | null;
          total_amount: number | null;
        };
        Insert: {
          acquirer_amount?: number | null;
          base_fee_amount?: number | null;
          created_at?: string;
          created_by?: string | null;
          fee_amount?: number | null;
          id?: number;
          issuer_amount?: number | null;
          issuer_lender_id?: number | null;
          job_id?: number | null;
          lender_id?: number | null;
          merchant_amount?: number | null;
          merchant_branch_id?: number | null;
          merchant_id?: number | null;
          settlement_type?: string | null;
          status?: string | null;
          total_amount?: number | null;
        };
        Update: {
          acquirer_amount?: number | null;
          base_fee_amount?: number | null;
          created_at?: string;
          created_by?: string | null;
          fee_amount?: number | null;
          id?: number;
          issuer_amount?: number | null;
          issuer_lender_id?: number | null;
          job_id?: number | null;
          lender_id?: number | null;
          merchant_amount?: number | null;
          merchant_branch_id?: number | null;
          merchant_id?: number | null;
          settlement_type?: string | null;
          status?: string | null;
          total_amount?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_settlements_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'payment_settlements_merchant_id_fkey';
            columns: ['merchant_id'];
            referencedRelation: 'merchants';
            referencedColumns: ['id'];
          }
        ];
      };
      payment_transactions: {
        Row: {
          amount: number | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          end_balance: number | null;
          id: number;
          payment_settlement_id: number | null;
          start_balance: number | null;
        };
        Insert: {
          amount?: number | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          end_balance?: number | null;
          id?: number;
          payment_settlement_id?: number | null;
          start_balance?: number | null;
        };
        Update: {
          amount?: number | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          end_balance?: number | null;
          id?: number;
          payment_settlement_id?: number | null;
          start_balance?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_transactions_payment_settlement_id_fkey';
            columns: ['payment_settlement_id'];
            referencedRelation: 'payment_settlements';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payment_transactions_payment_settlement_id_fkey';
            columns: ['payment_settlement_id'];
            referencedRelation: 'settlement_list';
            referencedColumns: ['id'];
          }
        ];
      };
      permissions: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          name: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          name: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          name?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          acquirer_rate: number | null;
          created_at: string;
          created_by: string | null;
          id: number;
          interest_rate: number | null;
          is_deleted: number | null;
          issuer_rate: number | null;
          name: string | null;
          status: string | null;
        };
        Insert: {
          acquirer_rate?: number | null;
          created_at?: string;
          created_by?: string | null;
          id?: number;
          interest_rate?: number | null;
          is_deleted?: number | null;
          issuer_rate?: number | null;
          name?: string | null;
          status?: string | null;
        };
        Update: {
          acquirer_rate?: number | null;
          created_at?: string;
          created_by?: string | null;
          id?: number;
          interest_rate?: number | null;
          is_deleted?: number | null;
          issuer_rate?: number | null;
          name?: string | null;
          status?: string | null;
        };
        Relationships: [];
      };
      role_permission: {
        Row: {
          created_at: string;
          id: number;
          perm_name: string | null;
          role_name: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          perm_name?: string | null;
          role_name?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          perm_name?: string | null;
          role_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'role_permission_fk';
            columns: ['perm_name'];
            referencedRelation: 'permissions';
            referencedColumns: ['name'];
          },
          {
            foreignKeyName: 'role_permission_fk_1';
            columns: ['role_name'];
            referencedRelation: 'roles';
            referencedColumns: ['name'];
          }
        ];
      };
      roles: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          name: string;
          user_type: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          name: string;
          user_type?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          name?: string;
          user_type?: string | null;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          created_at: string;
          email: string | null;
          fname: string | null;
          id_number: string | null;
          lname: string | null;
          phone: string | null;
          user_id: string;
          user_type: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          fname?: string | null;
          id_number?: string | null;
          lname?: string | null;
          phone?: string | null;
          user_id: string;
          user_type?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          fname?: string | null;
          id_number?: string | null;
          lname?: string | null;
          phone?: string | null;
          user_id?: string;
          user_type?: string | null;
        };
        Relationships: [];
      };
      user_role: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: number;
          role: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: number;
          role?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: number;
          role?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_role_role_fkey';
            columns: ['role'];
            referencedRelation: 'roles';
            referencedColumns: ['name'];
          }
        ];
      };
    };
    Views: {
      settlement_list: {
        Row: {
          acquirer_amount: number | null;
          base_fee_amount: number | null;
          branch_name: string | null;
          created_at: string | null;
          created_by: string | null;
          fee_amount: number | null;
          id: number | null;
          issuer_amount: number | null;
          issuer_lender_name: string | null;
          job_id: number | null;
          lender_name: string | null;
          merchant_amount: number | null;
          merchant_name: string | null;
          settlement_type: string | null;
          status: string | null;
          total_amount: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_settlements_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          }
        ];
      };
    };
    Functions: {
      branches_of_merchant_user: {
        Args: Record<PropertyKey, never>;
        Returns: {
          addr: string | null;
          bank_acc_name: string | null;
          bank_account: string | null;
          bank_code: string | null;
          city_id: number | null;
          created_at: string;
          created_by: string | null;
          district_id: number | null;
          email: string | null;
          id: number;
          merchant_id: number | null;
          name: string | null;
          phone: string | null;
          product_id: number | null;
        }[];
      };
      calculate_amounts: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      check_permission: {
        Args: {
          p_user_id: string;
          p_table_name: string;
          p_action_name: string;
        };
        Returns: number;
      };
      fc_bbsb_perm: {
        Args: {
          p_user_id: string;
          p_bbsb_id: number;
          p_action: string;
        };
        Returns: boolean;
      };
      fc_merchant_perm: {
        Args: {
          p_user_id: string;
          p_merchant_id: number;
          p_action: string;
        };
        Returns: boolean;
      };
      get_admin_dashboard: {
        Args: Record<PropertyKey, never>;
        Returns: {
          r_user_all: number;
          r_user_last_month: number;
          r_merchant_all: number;
          r_merchant_last_month: number;
          r_bbsb_all: number;
          r_bbsb_last_month: number;
          r_paid_all: number;
          r_paid_last_month: number;
        }[];
      };
      get_settlement_list: {
        Args: {
          user_id: string;
        };
        Returns: Record<string, unknown>;
      };
      getroles: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          role_name: string;
          role_desc: string;
          perm_name: string;
          perm_desc: string;
          checked: number;
        }[];
      };
      pay_qr_invoice: {
        Args: {
          code: string;
          issuer_lender_id: number;
          first_name: string;
          last_name: string;
          id_number: string;
          phone_number: string;
        };
        Returns: {
          acquirer_amount: number | null;
          amount: number | null;
          base_fee_amount: number | null;
          buyer_fname: string | null;
          buyer_id_number: string | null;
          buyer_lname: string | null;
          buyer_phone: string | null;
          created_at: string;
          created_by: string | null;
          fee_amount: number | null;
          id: number;
          invoice_id: number | null;
          issuer_amount: number | null;
          issuer_lender_id: number | null;
          job_id: number | null;
          lender_id: number | null;
          lender_settlement_id: number | null;
          merchant_amount: number | null;
          merchant_branch_id: number | null;
          merchant_id: number | null;
          merchant_settlement_id: number | null;
          product_id: number | null;
          qr_data: string | null;
          qr_type: string | null;
          status: string | null;
        };
      };
      settled_amount: {
        Args: Record<PropertyKey, never>;
        Returns: {
          acquirer_amount: number | null;
          amount: number | null;
          base_fee_amount: number | null;
          buyer_fname: string | null;
          buyer_id_number: string | null;
          buyer_lname: string | null;
          buyer_phone: string | null;
          created_at: string;
          created_by: string | null;
          fee_amount: number | null;
          id: number;
          invoice_id: number | null;
          issuer_amount: number | null;
          issuer_lender_id: number | null;
          job_id: number | null;
          lender_id: number | null;
          lender_settlement_id: number | null;
          merchant_amount: number | null;
          merchant_branch_id: number | null;
          merchant_id: number | null;
          merchant_settlement_id: number | null;
          product_id: number | null;
          qr_data: string | null;
          qr_type: string | null;
          status: string | null;
        }[];
      };
      test_unsettlement: {
        Args: Record<PropertyKey, never>;
        Returns: {
          acquirer_amount: number | null;
          amount: number | null;
          base_fee_amount: number | null;
          buyer_fname: string | null;
          buyer_id_number: string | null;
          buyer_lname: string | null;
          buyer_phone: string | null;
          created_at: string;
          created_by: string | null;
          fee_amount: number | null;
          id: number;
          invoice_id: number | null;
          issuer_amount: number | null;
          issuer_lender_id: number | null;
          job_id: number | null;
          lender_id: number | null;
          lender_settlement_id: number | null;
          merchant_amount: number | null;
          merchant_branch_id: number | null;
          merchant_id: number | null;
          merchant_settlement_id: number | null;
          product_id: number | null;
          qr_data: string | null;
          qr_type: string | null;
          status: string | null;
        }[];
      };
      total_buyers: {
        Args: Record<PropertyKey, never>;
        Returns: {
          acquirer_amount: number | null;
          amount: number | null;
          base_fee_amount: number | null;
          buyer_fname: string | null;
          buyer_id_number: string | null;
          buyer_lname: string | null;
          buyer_phone: string | null;
          created_at: string;
          created_by: string | null;
          fee_amount: number | null;
          id: number;
          invoice_id: number | null;
          issuer_amount: number | null;
          issuer_lender_id: number | null;
          job_id: number | null;
          lender_id: number | null;
          lender_settlement_id: number | null;
          merchant_amount: number | null;
          merchant_branch_id: number | null;
          merchant_id: number | null;
          merchant_settlement_id: number | null;
          product_id: number | null;
          qr_data: string | null;
          qr_type: string | null;
          status: string | null;
        }[];
      };
      total_sales: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      unsettled_amount: {
        Args: Record<PropertyKey, never>;
        Returns: {
          acquirer_amount: number | null;
          amount: number | null;
          base_fee_amount: number | null;
          buyer_fname: string | null;
          buyer_id_number: string | null;
          buyer_lname: string | null;
          buyer_phone: string | null;
          created_at: string;
          created_by: string | null;
          fee_amount: number | null;
          id: number;
          invoice_id: number | null;
          issuer_amount: number | null;
          issuer_lender_id: number | null;
          job_id: number | null;
          lender_id: number | null;
          lender_settlement_id: number | null;
          merchant_amount: number | null;
          merchant_branch_id: number | null;
          merchant_id: number | null;
          merchant_settlement_id: number | null;
          product_id: number | null;
          qr_data: string | null;
          qr_type: string | null;
          status: string | null;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
