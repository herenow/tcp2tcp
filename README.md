Tcp2Tcp
=========

This is a command line tool for initiating a simple tcp to tcp proxy. Maybe it's useful for somebody besides me :)

I may or may not add some better debugging features overtime.

Install
=========
```
npm install -g tcp2tcp
```

Usage
====
```

Sample usage: tcp2tcp -f 0.0.0.0:3600 -t 0.0.0.0:3601
Printing to file: tcp2tcp -f 0.0.0.0:3600 -t 0.0.0.0:3601 -p 2> send.data 1> received.data
Options:
  -f, --from     Proxy traffic from address (where should the proxy listen for connections).                                                        
  -t, --to       Proxy traffic to address (pass data to this address).                                                                              
  -l, --latency  Simulate network latency in ms.                                                                                                    
  -p, --print    Print all received data to stdout and stderr. All data sent will be printed to stderr and received data will be printed to stdout!.  [default: false]
  -v, --verbose  Verbose output of packets beeing proxies. If print is enabled this will automatically be disabled.                                   [default: true]
  -h, --help     Print help and usage information 
  
```
