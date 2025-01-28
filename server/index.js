const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = 'customers.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const customerProto = (grpc.loadPackageDefinition(packageDefinition)).CustomerService;


const customers = [
    {id: '1', name: 'John Doe', email: 'john.doe@example.com', phone: '1234567890'},
    {id: '2', name: 'Jane Doe', email: 'jane.doe@example.com', phone: '1234567890'},
    {id: '3', name: 'Jim Doe', email: 'jim.doe@example.com', phone: '1234567890'}
];
const server = new grpc.Server();
server.addService(customerProto.CustomerService.service, {
    getAll: (call,callback)=>{
        callback(null, {customers: customers});
    },
    get: (call,callback)=>{
        callback(null, {customer: customers.find(customer => customer.id === call.request.id)});
    },
    update: (call,callback)=>{
        const customer = customers.find(customer => customer.id === call.request.id);
        customer.name = call.request.name;
        customer.email = call.request.email;
        customer.phone = call.request.phone;
        callback(null, {customer: customer});
    },
    remove: (call,callback)=>{
        customers = customers.filter(customer => customer.id !== call.request.id);
        callback(null, {customer: {id: call.request.id}});
    }
});

server.bindAsync('0.0.0.0:50051',grpc.ServerCredentials.createInsecure(),(err,port)=>{
    if(err) throw err;
    server.start();
});

