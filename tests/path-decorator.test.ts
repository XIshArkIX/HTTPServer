import { Path } from '../src/lib/HTTPServer/decorators';

class A {
  constructor({}) {}

  @Path('/123')
  log(url: string) {
    console.log();
    // this.log[Symbol]
  }
}

new A({}).log('/123');
