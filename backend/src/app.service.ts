import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  checkHealth(): { status: boolean } {
    return { status: true };
  }
}
