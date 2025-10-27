import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { EquipmentController } from './equipment.controller';
import { SuppliersController } from './suppliers.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    InventoryController,
    PurchaseOrdersController,
    EquipmentController,
    SuppliersController,
  ],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
