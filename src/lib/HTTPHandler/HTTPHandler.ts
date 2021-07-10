import { ClientRequest, ServerResponse } from 'http';
import { EventFunctionsType } from '../HTTPServer/enums/EventFunctions';

interface IHTTPHandlerProps {
  url?: string;
  regex?: RegExp;
  ends?: string;
  name: string;
}

abstract class HTTPHandler {
  url?: string;
  regex?: RegExp;
  ends?: string;
  name!: string;

  constructor(props: IHTTPHandlerProps) {}

  pre?: EventFunctionsType<'connect'> = () => {};
  on: EventFunctionsType<'request'> = (req, res, data) => {};
  post?: EventFunctionsType<'disconnect'> = () => {};
}

export default HTTPHandler;
