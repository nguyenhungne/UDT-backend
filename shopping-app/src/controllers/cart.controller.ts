import {
  FilterExcludingWhere,
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  del,
  response,
  HttpErrors,
} from '@loopback/rest';
import {Cart} from '../models';
import {CartRepository, TokenRepository} from '../repositories';
import { authenticate, TokenService } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { MyUserService, TokenServiceBindings, UserServiceBindings } from '@loopback/authentication-jwt';
import { UserProfile, SecurityBindings, securityId } from '@loopback/security';

export class CartController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @repository (TokenRepository) public tokenRepository: TokenRepository,
    @repository(CartRepository)
    public cartRepository : CartRepository,
  ) {}

  @authenticate('jwt')
  @post('/carts/{customerId}')
  @response(200, {
    description: 'Cart model instance',
    content: {'application/json': {schema: getModelSchemaRef(Cart)}},
  })
  async create(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('customerId') customerId: string,
  ): Promise<Cart> {
    const token = await this.tokenRepository.findOne({where: {userId: currentUserProfile[securityId]}});
  if (!token) {
    throw new HttpErrors.Forbidden('TOKEN IS INVALID');
  }
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== "customer") {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return this.cartRepository.create({customerId});
  }

  @authenticate('jwt')
  @get('/customer/{customerId}/carts/{id}')
  @response(200, {
    description: 'Cart model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Cart, {includeRelations: true}),
      },
    },
  })
  async findById(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('customerId') customerId: string,
    @param.path.string('id') id: string,
    @param.filter(Cart, {exclude: 'where'}) filter?: FilterExcludingWhere<Cart>
  ): Promise<Cart> {
    const token = await this.tokenRepository.findOne({where: {userId: currentUserProfile[securityId]}});
  if (!token) {
    throw new HttpErrors.Forbidden('TOKEN IS INVALID');
  }
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== "customer" || user.id !== customerId) {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return this.cartRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @del('/customer/{customerId}/carts/{id}')
  @response(204, {
    description: 'Cart DELETE success',
  })
  async deleteById(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('customerId') customerId: string,
    @param.path.string('id') id: string,
  ): Promise<void> {
    const token = await this.tokenRepository.findOne({where: {userId: currentUserProfile[securityId]}});
  if (!token) {
    throw new HttpErrors.Forbidden('TOKEN IS INVALID');
  }
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== "customer" || user.id !== customerId) {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    await this.cartRepository.deleteById(id);
  }
}
