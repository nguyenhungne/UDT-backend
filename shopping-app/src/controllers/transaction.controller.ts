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
import {Admin, Transaction} from '../models';
import {TransactionRepository} from '../repositories';
import { authenticate, TokenService } from '@loopback/authentication';
import { UserProfile, securityId,SecurityBindings  } from '@loopback/security';
import { inject } from '@loopback/core';
import { MyUserService, TokenServiceBindings, UserServiceBindings } from '@loopback/authentication-jwt';

export class TransactionController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @repository(TransactionRepository) public transactionRelations: TransactionRepository,
    @repository(TransactionRepository)
    public transactionRepository : TransactionRepository,
  ) {}

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
  ): Promise<Transaction[]> {
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role !== 'admin') {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return this.transactionRepository.find();
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
    if (user.role == 'admin' || user.role == 'agency') {
      return this.transactionRelations.find({
        where: {
          customerId: customerId,
        },
      });
    } else {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
  }



  @authenticate({strategy: 'jwt'})
  @get('/customer/{customerId}/transactions/{id}/products/{productId}')
  @response(200, {
    description: 'Admin model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Transaction, {includeRelations: true}),
      },
    },
  })
  async findTransactionsByCustomerIdAndProductId(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('customerId') customerId: string,
    @param.path.string('transactionId') id: string,
    @param.path.string('productId') productId: string,
  ): Promise<Transaction[]> {
    const user = await this.userService.findUserById(currentUserProfile[securityId]);
    if (user.role == 'customer') {
      return this.transactionRepository.find({
        where: {
          id: id,
          customerId: customerId,
          productId: productId,
        },
      });
    } else {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
  }
}
