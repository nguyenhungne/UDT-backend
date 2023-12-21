import {
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  getModelSchemaRef,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {Admin} from '../models';
import {AdminRepository, TokenRepository, BillingRepository, TransactionRepository} from '../repositories';
import {
  MyUserService,
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {authenticate, TokenService} from '@loopback/authentication';
import { UserProfile, securityId,SecurityBindings  } from '@loopback/security';

export class AdminController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @repository(TokenRepository) public tokenRepository: TokenRepository,
    @repository(BillingRepository) public BillingRepository: BillingRepository,
    @repository(TransactionRepository) public transactionRelations: TransactionRepository,
    @repository(AdminRepository)
    public adminRepository: AdminRepository,
  ) {}

@authenticate('jwt')
@post('/admin/create')
@response(200, {
  description: 'Admin model instance',
  content: {'application/json': {schema: getModelSchemaRef(Admin)}},
})
async createAccount(
  @requestBody({
    content: {
      'application/json': {
        schema: getModelSchemaRef(Admin, {
          title: 'NewAdmin',
        }),
      },
    },
  })
  admin: Admin,
  @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
): Promise<Admin> {
  const user = await this.userService.findUserById(currentUserProfile[securityId]);
  if (user.role !== 'admin') {
    throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
  }
  return this.adminRepository.create(admin);
}

  @authenticate({strategy: 'jwt'})
  @post('/admin/logout')
  @response(204, {
    description: 'Customer logout success',
  })
  async logout(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.header.string('Authorization') authHeader: string,
  ): Promise<void> {
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== 'admin') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    const token = authHeader.replace('Bearer ', '');
    if (token) {
      this.tokenRepository.deleteAll({tokenValue: token});
    } else {
      throw new Error('No token found');
    }
  }

}