import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { SupabaseService } from './supabase.service';

@Module({
  controllers: [ContactController],
  providers: [ContactService, SupabaseService],
})
export class ContactModule { }
