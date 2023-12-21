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
import {CartItem} from '../models';
import {CartItemRepository} from '../repositories';
import { inject } from '@loopback/core';
import { MyUserService, TokenServiceBindings, UserServiceBindings } from '@loopback/authentication-jwt';
import { UserProfile, SecurityBindings, securityId } from '@loopback/security';
import { authenticate, TokenService } from '@loopback/authentication';

export class CartItemController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @repository(CartItemRepository)
    public cartItemRepository : CartItemRepository,
  ) {}
  
  @authenticate('jwt')
  @get('/carts/{cartId}/cart-items')
  @response(200, {
    description: 'Array of CartItem model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(CartItem, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('cartId') cartId: string,
    @param.query.object('filter') filter?: Filter<CartItem>,
  ): Promise<CartItem[]> {
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== "customer") {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return this.cartItemRepository.find({where: {cartId}, include: [{relation: 'product'}]});
  }
  
  @authenticate('jwt')
  @post('/carts/{cartId}/cart-items/product/{productId}')
  @response(200, {
    description: 'CartItem model instance',
    content: {'application/json': {schema: getModelSchemaRef(CartItem)}},
  })
  async create(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('cartId') cartId: string,
    @param.path.string('productId') productId: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CartItem, {
            title: 'NewCartItemInCart',
            exclude: ['id'],
            optional: ['cartId', 'productId']
          }),
        },
      },
    }) cartItem: Omit<CartItem, 'id'>,
  ): Promise<CartItem> {
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== "customer") {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return this.cartItemRepository.create({...cartItem, cartId, productId});
  }
  
  @del('/carts/{cartId}/cart-items/{id}/product/{productId}')
  @response(204, {
    description: 'CartItem DELETE success',
  })
  async deleteById(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('cartId') cartId: string,
    @param.path.string('id') id: string,
    @param.path.string('productId') productId: string,
  ): Promise<void> {
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== "customer") {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    await this.cartItemRepository.deleteById(
      id,
      {where: {cartId, productId}}
    );
  }

  @patch('/carts/{cartId}/cart-items/{id}/product/{productId}')
  @response(204, {
    description: 'CartItem PATCH success',
  })
  async updateById(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('cartId') cartId: string,
    @param.path.string('id') id: string,
    @param.path.string('productId') productId: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CartItem, {partial: true}),
        },
      },
    })
    cartItem: CartItem,
  ): Promise<void> {
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== "customer") {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    await this.cartItemRepository.updateById(id, cartItem);
  }
}