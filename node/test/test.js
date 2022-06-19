var chai = require('chai');
var chaiHttp = require('chai-http');

chai.use(chaiHttp);
var expect = chai.expect;

describe("test that verify if the web app is on",function(){
    it("should return status code 200",function(){
        chai.request("https://localhost:8083").get("/").end(function(err,res){
            expect(err).to.equal("self signed certificate");
            expect(res).to.have.status(200);
        });
    });
});