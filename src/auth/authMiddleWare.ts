// import { Injectable, NestMiddleware } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';
// import { AuthService } from './auth.service';

// @Injectable()
// export class AuthMiddleware implements NestMiddleware {
//   constructor(private readonly authService: AuthService) {}

//   async use(req: Request, res: Response, next: NextFunction) {
//     const token = req.headers.authorization?.split(' ')[1];

//     if (token) {
//       try {
//         const user = await this.authService.validateUserFromToken(token);
//         req.user = user; 
//         next();
//       } catch (error) {
//         res.status(401).json({ message: 'Unauthorized' });
//       }
//     } else {
//       res.status(401).json({ message: 'Unauthorized' });
//     }
//   }
// }
