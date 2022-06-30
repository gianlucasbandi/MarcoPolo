process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';     //Disabilito la verifica del certificato (poiché è self-signed)

var chai = require('chai');
var chaiHttp = require('chai-http');

chai.use(chaiHttp);
var expect = chai.expect;

describe("test that verify if the web app is on",function(){
    it("should return status code 200",function(done){
        chai.request("https://localhost:8083").get("/").end(function(err,res){
            expect(res).to.have.status(200);
            done();
        });
    });
});


//Test API: get covidData/:city
describe("test that verify if the covidData API works",function(){
    it("should return a json file unempty",function(done){
        chai.request("https://localhost:8083").get("/covidData/Roma").end(function(err,res){
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body.cases).to.not.be.undefined;
            done();
        });
    });
});