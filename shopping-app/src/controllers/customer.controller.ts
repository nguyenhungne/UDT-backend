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
import {Customer} from '../models';
import {CustomerRepository} from '../repositories';
import { Credentials, MyUserService, TokenServiceBindings, User, UserRepository, UserServiceBindings } from '@loopback/authentication-jwt';
import { inject } from '@loopback/core';
import { authenticate, TokenService } from '@loopback/authentication';
import { SecurityBindings } from '@loopback/security';
import { UserProfile } from '@loopback/security';
import { securityId } from '@loopback/security';
import { genSalt, hash } from 'bcryptjs';
import _ from 'lodash';

@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

//newCustomerRequest
export class NewCustomerRequest extends Customer {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}


const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: [ 'password', "username"],
  properties: {
    username: {
      type: 'string',
      format: 'username',
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
    @repository(CustomerRepository)
    public customerRepository : CustomerRepository,
  ) {}

  @post('/users/login', {
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
    return {token};
  }

  @authenticate('jwt')
  @get('/whoAmI', {
    responses: {
      '200': {
        description: 'Return current user',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async whoAmI(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<string> {
    return currentUserProfile[securityId];
  }

  // @post('/signup', {
  //   responses: {
  //     '200': {
  //       description: 'User',
  //       content: {
  //         'application/json': {
  //           schema: {
  //             'x-ts-type': User,
  //           },
  //         },
  //       },
  //     },
  //   },
  // })
  // async signUp(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(NewUserRequest, {
  //           title: 'NewUser',
  //         }),
  //       },
  //     },
  //   })
  //   newUserRequest: NewUserRequest,
  // ): Promise<User> {
  //   const password = await hash(newUserRequest.password, await genSalt());
  //   const savedUser = await this.userRepository.create(
  //     _.omit(newUserRequest, 'password'),
  //   );

  //   await this.userRepository.userCredentials(savedUser.id).create({password});

  //   return savedUser;
  // }




  @post('/customer/signup', {
    responses: {
      '200': {
        description: 'Customer',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': Customer,
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
            title: 'NewCustomer',
          }),
        },
      },
    })
    newCustomerRequest: NewCustomerRequest,
  ): Promise<Customer> {
    const password = await hash(newCustomerRequest.password, await genSalt());
    const savedCustomer = await this.customerRepository.create(
      _.omit(newCustomerRequest, 'password'),
    );
  
    await this.customerRepository.customerCredentials(savedCustomer.id).create({password});
  
    return savedCustomer;
  }



























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

  @del('/customers/{id}')
  @response(204, {
    description: 'Customer DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.customerRepository.deleteById(id);
  }
}
