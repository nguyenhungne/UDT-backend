import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'Shopping_app_database',
  connector: 'mongodb',
  url: 'mongodb+srv://nguyenhung123:Hung1234@atlascluster.rx1cs0y.mongodb.net/Shopping_app?retryWrites=true&w=majority',
  host: '',
  port: 0,
  user: '',
  password: '',
  database: '',
  useNewUrlParser: true
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class ShoppingAppDatabaseDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'Shopping_app_database';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.Shopping_app_database', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
