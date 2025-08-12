import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductFiltersDto } from './dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @Request() req: any
  ) {
    const merchantId = req.user.merchantId;
    return await this.productsService.createProduct(merchantId, createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get products with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProducts(
    @Query() filters: ProductFiltersDto,
    @Query() pagination: PaginationDto,
    @Request() req: any
  ) {
    const merchantId = req.user.merchantId;
    return await this.productsService.getProductsByMerchant(
      merchantId,
      filters,
      pagination
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID with full details' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProduct(@Param('id') id: string, @Request() req: any) {
    const merchantId = req.user.merchantId;
    return await this.productsService.getProductWithDetails(id, merchantId);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get product analytics and performance data' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProductAnalytics(@Param('id') id: string, @Request() req: any) {
    const merchantId = req.user.merchantId;
    return await this.productsService.getProductAnalytics(id, merchantId);
  }

  @Get(':id/compliance')
  @ApiOperation({ summary: 'Check product compliance status' })
  @ApiResponse({ status: 200, description: 'Compliance check completed' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProductCompliance(@Param('id') id: string, @Request() req: any) {
    const merchantId = req.user.merchantId;
    return await this.productsService.getProductCompliance(id, merchantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: any
  ) {
    const merchantId = req.user.merchantId;
    return await this.productsService.updateProduct(id, merchantId, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate product' })
  @ApiResponse({ status: 204, description: 'Product deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deactivateProduct(@Param('id') id: string, @Request() req: any) {
    const merchantId = req.user.merchantId;
    await this.productsService.deactivateProduct(id, merchantId);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Reactivate product' })
  @ApiResponse({ status: 200, description: 'Product activated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async activateProduct(@Param('id') id: string, @Request() req: any) {
    const merchantId = req.user.merchantId;
    return await this.productsService.updateProduct(id, merchantId, { isActive: true });
  }
}
