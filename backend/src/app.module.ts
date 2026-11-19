import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ClientesModule } from "./clientes/clientes.module";
import { CatalogoModule } from "./catalogo/catalogo.module";
import { MuestrasModule } from "./muestras/muestras.module";
import { UsuariosModule } from "./usuarios/usuarios.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ClientesModule,
    CatalogoModule,
    MuestrasModule,
    UsuariosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}