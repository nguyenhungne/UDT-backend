import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
  response,
  HttpErrors,
} from '@loopback/rest';
import {
  Credentials,
  MyUserService,
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import { UserProfile, securityId,SecurityBindings  } from '@loopback/security';
import {Admin, Billing} from '../models';
import {BillingRepository} from '../repositories';
import { authenticate, TokenService } from '@loopback/authentication';
import { inject } from '@loopback/core';

export class BillingController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @repository(BillingRepository)
    public BillingRepository : BillingRepository,
  ) {}

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
  @get('/customer/{customerId}/billings/{id}/product/{productId}')
  @response(200, {
    description: 'Admin model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Admin, {includeRelations: true}),
      },
    },
  })
  async findBillingById(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('customerId') customerId: string,
    @param.path.string('productId') productId: string,
    @param.path.string('id') id: string,
  ): Promise<Billing[]> {
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== 'customer') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return this.BillingRepository.find({
      where: {
        id: id,
        customerId: customerId,
        productId: productId,
      },
    });
  }


}
