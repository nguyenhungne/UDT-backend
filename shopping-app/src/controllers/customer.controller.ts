import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  model,
  property,
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
  SchemaObject,
} from '@loopback/rest';
import {Agency, Billing, Customer, Transaction} from '../models';
import {CustomerRepository} from '../repositories';
import { Credentials, MyUserService, TokenServiceBindings, User, UserRepository, UserServiceBindings } from '@loopback/authentication-jwt';
import { inject } from '@loopback/core';
import { authenticate, TokenService } from '@loopback/authentication';
import { SecurityBindings } from '@loopback/security';
import { UserProfile } from '@loopback/security';
import { genSalt, hash } from 'bcryptjs';
import _ from 'lodash';
import {TransactionRepository, BillingRepository, AgencyRepository, TokenRepository} from '../repositories';
@model()
//newCustomerRequest
export class NewCustomerRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}


const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ["email", 'password'],
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




export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};




export class CustomerController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(TransactionRepository) protected transactionRepository: TransactionRepository,
    @repository(BillingRepository) protected billingRepository: BillingRepository,
    @repository(TokenRepository) protected tokenRepository: TokenRepository,
    @repository(AgencyRepository) protected agencyRepository: AgencyRepository,
    @repository(CustomerRepository)
    public customerRepository : CustomerRepository,
  ) {}

  @post('/customer/login', {
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
    @requestBody(CredentialsRequestBody) credentials: Credentials,
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
    }
    await this.tokenRepository.create(newUser); 
    return {token};
  }


  @post('/customer/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NewCustomerRequest, {
            title: 'NewUser',
          }),
        },
      },
    })
    newCustomerRequest: NewCustomerRequest,
  ): Promise<User> {
    const password = await hash(newCustomerRequest.password, await genSalt());
    if (!newCustomerRequest.role) {
      newCustomerRequest.role = 'customer';
    }
    const savedUser = await this.userRepository.create(_.omit(newCustomerRequest, 'password'));

    await this.userRepository.userCredentials(savedUser.id).create({password});

    return savedUser;
  }


//find transactions by customer id  
@authenticate({strategy: 'jwt'})
@get('/customers/{id}/transactions')
@response(200, {
  description: 'Array of Customer model instances',
  content: {
    'application/json': {
      schema: {
        type: 'array',
        items: getModelSchemaRef(Transaction),
      },
    },
  },
})
async findTransactionsByCustomerId(
  @param.path.string('id') customerId: string,
): Promise<Transaction[]> {
  // Assuming you have a transactionRepository that has a findTransactionsByProductId method
  return this.transactionRepository.findTransactionsByCustomerId(customerId);
}

//find billing by customer id
@authenticate({strategy: 'jwt'})
@get('/customers/{id}/billing')
@response(200, {
  description: 'Array of Customer model instances',
  content: {
    'application/json': {
      schema: {
        type: 'array',
        items: getModelSchemaRef(Billing),
      },
    },
  },
})
async findBillingByCustomerId(
  @param.path.string('id') customerId: string,
): Promise<Billing[]> {
  // Assuming you have a transactionRepository that has a findTransactionsByProductId method
  return this.billingRepository.findBillingByCustomerId(customerId);
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
  @param.path.string('id') customerId: string,
  @param.query.string('productId') productId: string,
): Promise<{transactions: Transaction[], billings: Billing[]}> {
  const transactions = await this.transactionRepository.findTransactionsByCustomerIdAndProductId(customerId, productId);
  const billings = await this.billingRepository.findBillingByCustomerIdAndProductId(customerId, productId);

  return {transactions, billings};
}

@authenticate({strategy: 'jwt'})
@post('/customers/logout')
@response(204, {
  description: 'Customer logout success',
})
async logout(
  @param.header.string('Authorization') authHeader: string,
): Promise<void> {
  const token = authHeader.replace('Bearer ', '');
  if (token) {
    this.tokenRepository.deleteAll({tokenValue: token});
  } else {
    throw new Error('No token found');
  }
}

  // chinh sua thong tin khach hang
  @post('/customers')
  @response(200, {
    description: 'Customer model instance',
    content: {'application/json': {schema: getModelSchemaRef(Customer)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Customer, {
            title: 'NewCustomer',
            
          }),
        },
      },
    })
    customer: Customer,
  ): Promise<Customer> {
    return this.customerRepository.create(customer);
  }

  // dem so luong khach hang
  @get('/customers/count')
  @response(200, {
    description: 'Customer model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Customer) where?: Where<Customer>,
  ): Promise<Count> {
    return this.customerRepository.count(where);
  }

  // tim kiem khach hang
  @get('/customers')
  @response(200, {
    description: 'Array of Customer model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Customer, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Customer) filter?: Filter<Customer>,
  ): Promise<Customer[]> {
    return this.customerRepository.find(filter);
  }

  // cap nhat thong tin khach hang
  @patch('/customers')
  @response(200, {
    description: 'Customer PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Customer, {partial: true}),
        },
      },
    })
    customer: Customer,
    @param.where(Customer) where?: Where<Customer>,
  ): Promise<Count> {
    return this.customerRepository.updateAll(customer, where);
  }

  // lay thong tin khach hang theo id
  @get('/customers/{id}')
  @response(200, {
    description: 'Customer model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Customer, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Customer, {exclude: 'where'}) filter?: FilterExcludingWhere<Customer>
  ): Promise<Customer> {
    return this.customerRepository.findById(id, filter);
  }

  // cap nhat thong tin khach hang theo id
  @patch('/customers/{id}')
  @response(204, {
    description: 'Customer PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Customer, {partial: true}),
        },
      },
    })
    customer: Customer,
  ): Promise<void> {
    await this.customerRepository.updateById(id, customer);
  }

  // thay the thong tin khach hang theo id
  @put('/customers/{id}')
  @response(204, {
    description: 'Customer PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() customer: Customer,
  ): Promise<void> {
    await this.customerRepository.replaceById(id, customer);
  }

  // xoa thong tin khach hang theo id
  @del('/customers/{id}')
  @response(204, {
    description: 'Customer DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.customerRepository.deleteById(id);
  }
}
