// import { Injectable, NestMiddleware } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';
// import { AuthService } from '../auth.service';

// @Injectable()
// export class RoleMiddleware implements NestMiddleware {
//     constructor(private authService: AuthService) {}

//     async use(req: Request, res: Response, next: NextFunction) {
//         try {
//             if (req.user) {
//                 const userId = req.user.sub;
//                 const user = await this.authService.findUserById(userId);
//                 if (user && user.role === 'admin') {
//                     next();
//                 } else {
//                     res.status(403).send('Forbidden');
//                 }
//             } else {
//                 res.status(401).send('Unauthorized');
//             }
//         } catch (error) {
//             console.error(error);
//             res.status(500).send('Internal Server Error');
//         }
//     }
// }
