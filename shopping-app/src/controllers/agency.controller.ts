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
import {Agency, Product} from '../models';
import {AgencyRepository, TokenRepository, ProductRepository} from '../repositories';
import { authenticate, TokenService } from '@loopback/authentication';
import { Credentials, MyUserService, TokenServiceBindings, User, UserRepository, UserServiceBindings } from '@loopback/authentication-jwt';
import { inject } from '@loopback/core';
import { genSalt, hash } from 'bcryptjs';
import _ from 'lodash';

@model()
export class NewUserRequest extends Agency {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

export class NewAgencyRequest extends Agency {
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


export class AgencyController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(TokenRepository) public tokenRepository: TokenRepository,
    @repository(ProductRepository) public ProductRepository: ProductRepository,
    @repository(AgencyRepository)
    public agencyRepository : AgencyRepository,
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



  @post('/agency/signup', {
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
          schema: getModelSchemaRef(NewUserRequest, {
            title: 'NewUser',
          }),
        },
      },
    })
    newUserRequest: NewUserRequest,
  ): Promise<User> {
    const password = await hash(newUserRequest.password, await genSalt());
    const savedUser = await this.userRepository.create(_.omit(newUserRequest, 'password'));

    await this.userRepository.userCredentials(savedUser.id).create({password});

    const newCustomer = _.omit(newUserRequest, 'password');
    await this.agencyRepository.create(newCustomer);

    return savedUser;
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













  @post('/agencies')
  @response(200, {
    description: 'Agency model instance',
    content: {'application/json': {schema: getModelSchemaRef(Agency)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Agency, {
            title: 'NewAgency',
            
          }),
        },
      },
    })
    agency: Agency,
  ): Promise<Agency> {
    return this.agencyRepository.create(agency);
  }

  @get('/agencies/count')
  @response(200, {
    description: 'Agency model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Agency) where?: Where<Agency>,
  ): Promise<Count> {
    return this.agencyRepository.count(where);
  }

  @get('/agencies')
  @response(200, {
    description: 'Array of Agency model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Agency, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Agency) filter?: Filter<Agency>,
  ): Promise<Agency[]> {
    return this.agencyRepository.find(filter);
  }

  @patch('/agencies')
  @response(200, {
    description: 'Agency PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Agency, {partial: true}),
        },
      },
    })
    agency: Agency,
    @param.where(Agency) where?: Where<Agency>,
  ): Promise<Count> {
    return this.agencyRepository.updateAll(agency, where);
  }

  @authenticate('jwt')
  @get('/agencies/{id}')
  @response(200, {
    description: 'Agency model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Agency, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Agency, {exclude: 'where'}) filter?: FilterExcludingWhere<Agency>
  ): Promise<Agency> {
    return this.agencyRepository.findById(id, filter);
  }

  @patch('/agencies/{id}')
  @response(204, {
    description: 'Agency PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Agency, {partial: true}),
        },
      },
    })
    agency: Agency,
  ): Promise<void> {
    await this.agencyRepository.updateById(id, agency);
  }

  @put('/agencies/{id}')
  @response(204, {
    description: 'Agency PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() agency: Agency,
  ): Promise<void> {
    await this.agencyRepository.replaceById(id, agency);
  }

  @del('/agencies/{id}')
  @response(204, {
    description: 'Agency DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.agencyRepository.deleteById(id);
  }
}
