import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private client: SupabaseClient;
    private adminClient: SupabaseClient;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');
        const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase configuration (URL and Key) is missing in environment variables.');
        }

        this.client = createClient(supabaseUrl, supabaseKey);

        if (serviceRoleKey) {
            this.adminClient = createClient(supabaseUrl, serviceRoleKey);
        }
    }

    getClient(): SupabaseClient {
        return this.client;
    }

    getAdminClient(): SupabaseClient {
        if (!this.adminClient) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.');
        }
        return this.adminClient;
    }
}
