import { Module } from "@nestjs/common";
import { MuestrasController } from "./muestras.controller";
import { MuestrasService } from "./muestras.service";

@Module({
  controllers: [MuestrasController],
  providers: [MuestrasService],
})
export class MuestrasModule {}