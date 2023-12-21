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
  HttpErrors,
} from '@loopback/rest';
import { Agency } from '../models';
import {
  AgencyRepository,
  TokenRepository,
  ProductRepository,
} from '../repositories';
import { authenticate, TokenService } from '@loopback/authentication';
import {
  MyUserService,
  TokenServiceBindings,
  User,
  UserRepository,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import { inject } from '@loopback/core';
import { genSalt, hash } from 'bcryptjs';
import { UserProfile, securityId, SecurityBindings } from '@loopback/security';
import _ from 'lodash';

@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

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
    public agencyRepository: AgencyRepository,
  ) { }

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
    if (!newUserRequest.role) {
      newUserRequest.role = 'agency';
    }
    const password = await hash(newUserRequest.password, await genSalt());
    const savedUser = await this.userRepository.create(
      _.omit(newUserRequest, 'password'),
    );

    await this.userRepository.userCredentials(savedUser.id).create({ password });

    return savedUser;
  }

  @authenticate({ strategy: 'jwt' })
  @post('/agency/logout')
  @response(204, {
    description: 'Customer logout success',
  })
  async logout(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.header.string('Authorization') authHeader: string,
  ): Promise<void> {
    const user = await this.userService.findUserById(
      currentUserProfile[securityId],
    );
    if (user.role !== 'agency') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    const token = authHeader.replace('Bearer ', '');
    if (token) {
      this.tokenRepository.deleteAll({ tokenValue: token });
    } else {
      throw new Error('No token found');
    }
  }

  // tao 1 agency
  @post('/agencies')
  @response(200, {
    description: 'Agency model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Agency) } },
  })
  async create(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
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
    const user = await this.userService.findUserById(
      currentUserProfile[securityId],
    );
    if (user.role !== 'admin') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return this.agencyRepository.create(agency);
  }

  // dem so luong agency
  @get('/agencies/count')
  @response(200, {
    description: 'Agency model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(@param.where(Agency) where?: Where<Agency>): Promise<Count> {
    return this.agencyRepository.count(where);
  }

  // lay danh sach cac agency
  @get('/agencies')
  @response(200, {
    description: 'Array of Agency model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Agency, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(Agency) filter?: Filter<Agency>): Promise<Agency[]> {
    return this.agencyRepository.find(filter);
  }

  // update 1 phan thong tin cua 1 agency
  @authenticate('jwt')
  @patch('/agencies')
  @response(200, {
    description: 'Agency PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Agency, { partial: true }),
        },
      },
    })
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    agency: Agency,
    @param.where(Agency) where?: Where<Agency>,
  ): Promise<Count> {
    const user = await this.userService.findUserById(
      currentUserProfile[securityId],
    );
    if (user.role !== 'agency') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return this.agencyRepository.updateAll(agency, where);
  }

  // lay 1 agency
  @authenticate('jwt')
  @get('/agencies/{id}')
  @response(200, {
    description: 'Agency model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Agency, { includeRelations: true }),
      },
    },
  })
  async findById(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
    @param.filter(Agency, { exclude: 'where' })
    filter?: FilterExcludingWhere<Agency>,
  ): Promise<Agency> {
    const user = await this.userService.findUserById(
      currentUserProfile[securityId],
    );
    if (user.role !== 'agency') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return this.agencyRepository.findById(id, filter);
  }

  // update toan bo thong tin cua 1 agency
  @authenticate('jwt')
  @patch('/agencies/{id}')
  @response(204, {
    description: 'Agency PATCH success',
  })
  async updateById(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Agency, { partial: true }),
        },
      },
    })
    agency: Agency,
  ): Promise<void> {
    const user = await this.userService.findUserById(
      currentUserProfile[securityId],
    );
    if (user.role !== 'agency') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    await this.agencyRepository.updateById(id, agency);
  }

  // update toan bo thong tin cua 1 agency
  @authenticate('jwt')
  @put('/agencies/{id}')
  @response(204, {
    description: 'Agency PUT success',
  })
  async replaceById(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
    @requestBody() agency: Agency,
  ): Promise<void> {
    const user = await this.userService.findUserById(
      currentUserProfile[securityId],
    );
    if (user.role !== 'agency') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    await this.agencyRepository.replaceById(id, agency);
  }

  // xoa 1 agency
  @authenticate('jwt')
  @del('/agencies/{id}')
  @response(204, {
    description: 'Agency DELETE success',
  })
  async deleteById(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
  ): Promise<void> {
    const user = await this.userService.findUserById(
      currentUserProfile[securityId],
    );
    if (user.role !== 'admin') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    await this.agencyRepository.deleteById(id);
  }
}
