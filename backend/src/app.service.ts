import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  getInfo() {
    return {
      name: 'CircleWorks API',
      version: '1.0.0',
      environment: process.env.API_ENV || 'development',
      apiVersion: process.env.API_VERSION || 'v1',
      timestamp: new Date().toISOString(),
    };
  }
}
