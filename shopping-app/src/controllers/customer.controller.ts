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
} from '@loopback/rest';
import {Customer} from '../models';
import {CustomerRepository} from '../repositories';
import { MyUserService, TokenServiceBindings, User, UserRepository, UserServiceBindings } from '@loopback/authentication-jwt';
import { inject } from '@loopback/core';
import { authenticate, TokenService } from '@loopback/authentication';
import { SecurityBindings,UserProfile  } from '@loopback/security';
import { genSalt, hash } from 'bcryptjs';
import _ from 'lodash';
import {TransactionRepository, BillingRepository, AgencyRepository, TokenRepository} from '../repositories';
@model()
export class NewCustomerRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

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
