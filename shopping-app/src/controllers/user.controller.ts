import {
  repository,
} from '@loopback/repository';
import {
  param,
  post,
  requestBody,
  SchemaObject,
  response
} from '@loopback/rest';
import {AdminRepository, TokenRepository} from '../repositories';
import { Credentials, MyUserService, TokenServiceBindings, UserServiceBindings } from '@loopback/authentication-jwt';
import { inject } from '@loopback/core';
import { TokenService, authenticate } from '@loopback/authentication';

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

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};



export class UserController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @repository (TokenRepository) public tokenRepository: TokenRepository,
    @repository(AdminRepository)
    public adminRepository : AdminRepository,
  ) {}


  @post('/login', {
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
    };
    await this.tokenRepository.create(newUser);
    return {token};
  }
  

  @authenticate({strategy: 'jwt'})
  @post('/logout')
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
}
