import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {Billing, Product, Transaction} from '../models';
import {ProductRepository, TransactionRepository, BillingRepository, TokenRepository} from '../repositories';
import {authenticate, TokenService} from '@loopback/authentication';
import { UserProfile, securityId,SecurityBindings  } from '@loopback/security';
import { inject } from '@loopback/core';
import { MyUserService, TokenServiceBindings, UserServiceBindings } from '@loopback/authentication-jwt';

export class ProductController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @repository(TokenRepository) public tokenRepository: TokenRepository,
    @repository(TransactionRepository) public transactionRepository: TransactionRepository,
    @repository(BillingRepository) public billingRepository: BillingRepository,
    @repository(ProductRepository)
    public ProductRepository : ProductRepository,
  ) {}

  // lay 1 product cua 1 agency
  @authenticate('jwt')
  @del('/agencies/{id}/products{productId}')
  @response(204, {
    description: 'Agency DELETE success',
  })
  async deleteProductsOfAgency(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
    @param.path.string('productId') productId: string
    ): Promise<void> {
      const token = await this.tokenRepository.findOne({where: {userId: currentUserProfile[securityId]}});
    if (!token) {
      throw new HttpErrors.Forbidden('TOKEN IS INVALID');
    }
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== 'agency') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    await this.ProductRepository.deleteAll({agencyId: id, id: productId});
  }

  // lay danh sach cac product cua 1 agency
  @authenticate('jwt')
  @get("/agency/{id}/products")
  @response(200, {
    description: 'Array of Product model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Product, {includeRelations: true}),
        },
      },
    },
  })
  async findProducts(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
    @param.filter(Product) filter?: Filter<Product>,
  ): Promise<Product[]> {
    const token = await this.tokenRepository.findOne({where: {userId: currentUserProfile[securityId]}});
    if (!token) {
      throw new HttpErrors.Forbidden('TOKEN IS INVALID');
    }
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== 'agency') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return this.ProductRepository.find({where: {agencyId: id}});
  }

  // tao 1 product cua 1 agency
  @authenticate('jwt')
  @post('/agency/{id}/products')
  @response(200, {
    description: 'Product model instance',
    content: {'application/json': {schema: getModelSchemaRef(Product)}},
  })
  async createProduct(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: typeof Product.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {
            title: 'NewProductInAgency',
            exclude: ['id'],
            optional: ['agencyId']
          }),
        },
      },
    }) product: Omit<Product, 'id'>,
  ): Promise<Product> {
    const token = await this.tokenRepository.findOne({where: {userId: currentUserProfile[securityId]}});
    if (!token) {
      throw new HttpErrors.Forbidden('TOKEN IS INVALID');
    }
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== 'agency') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return this.ProductRepository.createProductOfAgency(id, product);
  }

    // update 1 phan thong tin cua 1 product
  @authenticate('jwt')
  @patch('/agencies/{id}/products{productId}')
  @response(204, {
    description: 'Agency PATCH success',
  })
  async updateProductsOfAgency(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
    @param.path.string('productId') productId: string,
    @requestBody() product: Partial<Product>,
  ): Promise<void> {
    const token = await this.tokenRepository.findOne({where: {userId: currentUserProfile[securityId]}});
    if (!token) {
      throw new HttpErrors.Forbidden('TOKEN IS INVALID');
    }
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== 'agency') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    await this.ProductRepository.updateAll(product, {agencyId: id, id: productId});
  }

  // update toan bo thong tin cua 1 product
  @authenticate('jwt')
  @put('/agencies/products{productId}')
  @response(204, {  
    description: 'Agency PUT success',
  })
  async replaceProductsOfAgency(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('productId') productId: string,
    @requestBody() product: Product,
  ): Promise<void> {
    const token = await this.tokenRepository.findOne({where: {userId: currentUserProfile[securityId]}});
    if (!token) {
      throw new HttpErrors.Forbidden('TOKEN IS INVALID');
    }
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== 'agency') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    await this.ProductRepository.replaceById(productId, product);
  }

  @authenticate({strategy: 'jwt'})
@get('/customers/{id}/product-details,{productId}')
@response(200, {
  description: 'Product details for a customer',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          transactions: {
            type: 'array',
            items: getModelSchemaRef(Transaction),
          },
          billings: {
            type: 'array',
            items: getModelSchemaRef(Billing),
          },
        },
      },
    },
  },
})
async findProductDetails(
  @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  @param.path.string('id') customerId: string,
  @param.query.string('productId') productId: string,
): Promise<{transactions: Transaction[], billings: Billing[]}> {
  const token = await this.tokenRepository.findOne({where: {userId: currentUserProfile[securityId]}});
    if (!token) {
      throw new HttpErrors.Forbidden('TOKEN IS INVALID');
    }
  const user = await this.userService.findUserById(currentUserProfile[securityId]);
  if (user.role !== 'customer') {
    throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
  }
  const transactions = await this.transactionRepository.findTransactionsByCustomerIdAndProductId(customerId, productId);
  const billings = await this.billingRepository.findBillingByCustomerIdAndProductId(customerId, productId);

  return {transactions, billings};
}
}
