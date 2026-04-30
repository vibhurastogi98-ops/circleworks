import {
  Controller,
  Get,
  Put,
  Delete,
  Request,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getCurrentUser(@Request() req: any) {
    return this.usersService.getCurrentUser(req.user.id);
  }

  @Put('me')
  async updateUser(@Request() req: any, @Body() data: any) {
    return this.usersService.updateUser(req.user.id, data);
  }

  @Get('me/preferences')
  async getUserPreferences(@Request() req: any) {
    return this.usersService.getUserPreferences(req.user.id);
  }

  @Put('me/tour')
  @HttpCode(HttpStatus.OK)
  async updateTourStatus(@Request() req: any, @Body() body: { hasCompletedTour: boolean }) {
    return this.usersService.updateTourStatus(req.user.id, body.hasCompletedTour);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Request() req: any) {
    return this.usersService.deleteUser(req.user.id);
  }
}
