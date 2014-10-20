/* Node.js native GPIO library extension for rockchip soc.
 * Copyright (c) 2014 Jeremy Darling
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

#include <node.h>
#include <v8.h>

#include "gpio_lib.h"

using namespace v8;

Handle<Value> SayHello(const Arguments& args) {
  HandleScope scope;

  return scope.Close(String::New("Hello from Rock!"));
}

Handle<Value> PinBankInfo(const Arguments& args) {
  HandleScope scope;

  if(args.Length() < 1){
    ThrowException(Exception::TypeError(String::New("Expects 1 argument (bankNumber)")));
    return scope.Close(Undefined());
  }

  if(!args[0]->IsNumber()){
    ThrowException(Exception::TypeError(String::New("First argument must be an Integer")));
    return scope.Close(Undefined());
  }

  int bank_number = (int)(args[0]->Int32Value());

  return scope.Close(Number::New(pin_bank_info(bank_number).pin_base));
}

Handle<Value> Init(const Arguments& args) {
  HandleScope scope;
  if(rockchip_gpio_init() < 0){
    ThrowException(Exception::TypeError(String::New("Failed to init Radxa Rock native interface")));
  }
  return scope.Close(Undefined());
}

Handle<Value> SetPinValue(const Arguments& args) {
  HandleScope scope;

  if(args.Length() < 2){
    ThrowException(Exception::TypeError(String::New("Expects 2 arguments (pin, value)")));
    return scope.Close(Undefined());
  }

  if(!args[0]->IsNumber()){
    ThrowException(Exception::TypeError(String::New("First argument must be an Integer")));
    return scope.Close(Undefined());
  }

  if(!args[1]->IsNumber()){
    ThrowException(Exception::TypeError(String::New("Second argument must be an Integer")));
    return scope.Close(Undefined());
  }

  int pin = (int)(args[0]->Int32Value());
  int value = (int)(args[1]->Int32Value());

  if(rockchip_gpio_output(pin, value) < 0){
    ThrowException(Exception::TypeError(String::New("Could not set value on port")));
    return scope.Close(Undefined());
  }

  return scope.Close(Number::New(1));
}

Handle<Value> GetPinValue(const Arguments& args) {
  HandleScope scope;

  if(args.Length() < 1){
    ThrowException(Exception::TypeError(String::New("Expects 1 argument (pin)")));
    return scope.Close(Undefined());
  }

  if(!args[0]->IsNumber()){
    ThrowException(Exception::TypeError(String::New("First argument must be an Integer")));
    return scope.Close(Undefined());
  }

  int pin = (int)(args[0]->Int32Value());
  int ret = rockchip_gpio_input(pin);

  if(ret < 0){
    ThrowException(Exception::TypeError(String::New("Could not set value on port")));
    return scope.Close(Undefined());
  }

  return scope.Close(Number::New(ret));
}

Handle<Value> SetPinMode(const Arguments& args) {
  HandleScope scope;

  if(args.Length() < 2){
    ThrowException(Exception::TypeError(String::New("Expects 2 arguments (pin, value)")));
    return scope.Close(Undefined());
  }

  if(!args[0]->IsNumber()){
    ThrowException(Exception::TypeError(String::New("First argument must be an Integer")));
    return scope.Close(Undefined());
  }

  if(!args[1]->IsNumber()){
    ThrowException(Exception::TypeError(String::New("Second argument must be an Integer")));
    return scope.Close(Undefined());
  }

  int pin = (int)(args[0]->Int32Value());
  int value = (int)(args[1]->Int32Value());

  if(rockchip_gpio_set_mux(pin, value) < 0){
    ThrowException(Exception::TypeError(String::New("Could not set mode of pin")));
    return scope.Close(Undefined());
  }

  return scope.Close(Number::New(1));
}

Handle<Value> GetPinMode(const Arguments& args) {
  HandleScope scope;

  if(args.Length() < 1){
    ThrowException(Exception::TypeError(String::New("Expects 2 arguments (pin, value)")));
    return scope.Close(Undefined());
  }

  if(!args[0]->IsNumber()){
    ThrowException(Exception::TypeError(String::New("First argument must be an Integer")));
    return scope.Close(Undefined());
  }

  int pin = (int)(args[0]->Int32Value());
  int ret = rockchip_gpio_get_mux(pin);

  if(ret < 0){
    ThrowException(Exception::TypeError(String::New("Could not get mode of pin")));
    return scope.Close(Undefined());
  }

  return scope.Close(Number::New(ret));
}

Handle<Value> SetPinPullup(const Arguments& args) {
  HandleScope scope;

  if(args.Length() < 2){
    ThrowException(Exception::TypeError(String::New("Expects 2 arguments (pin, value)")));
    return scope.Close(Undefined());
  }

  if(!args[0]->IsNumber()){
    ThrowException(Exception::TypeError(String::New("First argument must be an Integer")));
    return scope.Close(Undefined());
  }

  if(!args[1]->IsNumber()){
    ThrowException(Exception::TypeError(String::New("Second argument must be an Integer")));
    return scope.Close(Undefined());
  }

  int pin = (int)(args[0]->Int32Value());
  int value = (int)(args[1]->Int32Value());

  if(rockchip_gpio_pullup(pin, value) < 0){
    ThrowException(Exception::TypeError(String::New("Could not set pullup on port")));
    return scope.Close(Undefined());
  }

  return scope.Close(Number::New(1));
}

void init(Handle<Object> exports) {
  exports->Set(String::NewSymbol("init"),
      FunctionTemplate::New(Init)->GetFunction());
  exports->Set(String::NewSymbol("set_pin_value"),
      FunctionTemplate::New(SetPinValue)->GetFunction());
  exports->Set(String::NewSymbol("get_pin_value"),
      FunctionTemplate::New(GetPinValue)->GetFunction());
  exports->Set(String::NewSymbol("set_pin_mode"),
      FunctionTemplate::New(SetPinMode)->GetFunction());
  exports->Set(String::NewSymbol("get_pin_mode"),
      FunctionTemplate::New(GetPinMode)->GetFunction());
  exports->Set(String::NewSymbol("set_pin_pullup"),
      FunctionTemplate::New(SetPinPullup)->GetFunction());
  exports->Set(String::NewSymbol("say_hello"),
      FunctionTemplate::New(SayHello)->GetFunction());

  exports->Set(String::NewSymbol("get_bank_info"),
      FunctionTemplate::New(PinBankInfo)->GetFunction());
}

NODE_MODULE(gpio, init)
