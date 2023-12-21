import {
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  requestBody,
  response,
  SchemaObject,
  HttpErrors,
} from '@loopback/rest';
import {Admin, Billing, Transaction} from '../models';
import {AdminRepository, TokenRepository, BillingRepository, TransactionRepository} from '../repositories';
import {
  Credentials,
  MyUserService,
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {authenticate, TokenService} from '@loopback/authentication';
import { UserProfile, securityId,SecurityBindings  } from '@loopback/security';

const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
  },
};

export const AminCredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};

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

  @post('/admin/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(AminCredentialsRequestBody) credentials: Credentials,
  ): Promise<{token: string}> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);
    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);
    const newUser = {
      userId: user.id,
      tokenValue: token,
    };
    await this.tokenRepository.create(newUser);
    return {token};
  }

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

  @authenticate({strategy: 'jwt'})
  @get('/admin/billings')
  @response(200, {
    description: 'Admin model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Admin, {includeRelations: true}),
      },
    },
  })
  async findBillings(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<Billing[]> {
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== 'admin') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return this.BillingRepository.find();
  }

  @authenticate({strategy: 'jwt'})
  @get('/admin/transactions')
  @response(200, {
    description: 'Admin model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Admin, {includeRelations: true}),
      },
    },
  })
  async findTransactions(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<Billing[]> {
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== 'admin') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return this.BillingRepository.find();
  }

  @authenticate({strategy: 'jwt'})
  @get('/admin/billingsOfProduct/{productId}')
  @response(200, {
    description: 'Admin model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Admin, {includeRelations: true}),
      },
    },
  })
  async findBillingByProductId(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('productId') productId: string,
  ): Promise<Billing[]> {
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== 'admin') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return this.BillingRepository.find({
      where: {
        productId: productId,
      },
    });
  }

  @authenticate({strategy: 'jwt'})
  @get('/admin/billingsOfAgency/{agencyId}')
  @response(200, {
    description: 'Admin model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Admin, {includeRelations: true}),
      },
    },
  })
  async findBillingByAgencyId(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('agencyId') agencyId: string,
  ): Promise<Billing[]> {
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== 'admin') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return this.BillingRepository.find({
      where: {
        agencyId: agencyId,
      },
    });
  }

  @authenticate({strategy: 'jwt'})
  @get('/admin/billingsOfCustomer/{customerId}')
  @response(200, {
    description: 'Admin model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Admin, {includeRelations: true}),
      },
    },
  })
  async findBillingByCustomerId(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('customerId') customerId: string,
  ): Promise<Billing[]> {
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== 'admin') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return this.BillingRepository.find({
      where: {
        customerId: customerId,
      },
    });
  }


  @authenticate({strategy: 'jwt'})
  @get('/admin/transactionsOfProduct/{productId}')
  @response(200, {
    description: 'Admin model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Admin, {includeRelations: true}),
      },
    },
  })
  async findTransactionsByProductId(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('productId') productId: string,
  ): Promise<Transaction[]> {
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== 'admin') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return this.transactionRelations.find({
      where: {
        productId: productId,
      },
    });
  }


  @authenticate({strategy: 'jwt'})
  @get('/admin/transactionsPfAgency/{agencyId}')
  @response(200, {
    description: 'Admin model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Admin, {includeRelations: true}),
      },
    },
  })
  async findTransactionsByAgencyId(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('agencyId') agencyId: string,
  ): Promise<Transaction[]> {
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== 'admin') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return this.transactionRelations.find({
      where: {
        agencyId: agencyId,
      },
    });
  }

  @authenticate({strategy: 'jwt'})
  @get('/admin/transactionsOfCustomer/{customerId}')
  @response(200, {
    description: 'Admin model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Admin, {includeRelations: true}),
      },
    },
  })
  async findTransactionsByCustomerId(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('customerId') customerId: string,
  ): Promise<Transaction[]> {
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== 'admin') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return this.transactionRelations.find({
      where: {
        customerId: customerId,
      },
    });
  }
}