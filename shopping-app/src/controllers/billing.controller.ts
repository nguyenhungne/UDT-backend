import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
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
import {Billing} from '../models';
import {BillingRepository} from '../repositories';
import { authenticate } from '@loopback/authentication';

export class BillingController {
  constructor(
    @repository(BillingRepository)
    public billingRepository : BillingRepository,
  ) {}

  @authenticate('jwt')
  @post('/billings')
  @response(200, {
    description: 'Billing model instance',
    content: {'application/json': {schema: getModelSchemaRef(Billing)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Billing, {
            title: 'NewBilling',
            
          }),
        },
      },
    })
    billing: Billing,
  ): Promise<Billing> {
    return this.billingRepository.create(billing);
  }

  @authenticate('jwt')
  @get('/billings/count')
  @response(200, {
    description: 'Billing model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Billing) where?: Where<Billing>,
  ): Promise<Count> {
    return this.billingRepository.count(where);
  }


  @authenticate('jwt')
  @get('/billings')
  @response(200, {
    description: 'Array of Billing model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Billing, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Billing) filter?: Filter<Billing>,
  ): Promise<Billing[]> {
    return this.billingRepository.find(filter);
  }

  @patch('/billings')
  @response(200, {
    description: 'Billing PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Billing, {partial: true}),
        },
      },
    })
    billing: Billing,
    @param.where(Billing) where?: Where<Billing>,
  ): Promise<Count> {
    return this.billingRepository.updateAll(billing, where);
  }



  @authenticate('jwt')
  @get('/billings/{id}')
  @response(200, {
    description: 'Billing model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Billing, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Billing, {exclude: 'where'}) filter?: FilterExcludingWhere<Billing>
  ): Promise<Billing> {
    return this.billingRepository.findById(id, filter);
  }



  @authenticate('jwt')
  @patch('/billings/{id}')
  @response(204, {
    description: 'Billing PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Billing, {partial: true}),
        },
      },
    })
    billing: Billing,
  ): Promise<void> {
    await this.billingRepository.updateById(id, billing);
  }



  @authenticate('jwt')
  @put('/billings/{id}')
  @response(204, {
    description: 'Billing PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() billing: Billing,
  ): Promise<void> {
    await this.billingRepository.replaceById(id, billing);
  }



  @authenticate('jwt')
  @del('/billings/{id}')
  @response(204, {
    description: 'Billing DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.billingRepository.deleteById(id);
  }
}
