import Server from "../src/rest/Server";

import InsightFacade from "../src/controller/InsightFacade";
import {expect} from "chai";
import Log from "../src/Util";
import * as fs from "fs";
import chai = require("chai");
import chaiHttp = require("chai-http");
import Response = ChaiHttp.Response;

describe("Facade D3", function () {

    let facade: InsightFacade = null;
    let server: Server = null;

    chai.use(chaiHttp);

    before(function () {
        facade = new InsightFacade();
        server = new Server(4321);
        try {
            server.start();
            Log.info("Server started!");
        } catch (e) {
            Log.error("Server did not start!");
        }
    });

    after(function () {
        server.stop();
    });

    beforeEach(function () {
        Log.info("started test!");
    });

    afterEach(function () {
        Log.info("finished test!");
    });

    // Sample on how to format PUT requests

    it("PUT test for courses dataset", function () {
        let data = "./test/data/courses.zip";
        return chai.request("http://localhost:4321")
            .put("/dataset/courses/courses")
            .send(fs.readFileSync(data))
            .set("Content-Type", "application/x-zip-compressed")
            .then(function (res: Response) {
                // some logging here please!
                Log.info("reached");
                expect(res.status).to.be.equal(200);
            })
            .catch(function (err) {
                // some logging here please!
                Log.info(err);
                expect.fail();
            });
    });

    it("PUT test for rooms dataset", function () {
        let data = "./test/data/rooms.zip";
        return chai.request("http://localhost:4321")
            .put("/dataset/rooms/rooms")
            .send(fs.readFileSync(data))
            .set("Content-Type", "application/x-zip-compressed")
            .then(function (res: Response) {
                // some logging here please!
                Log.info("reached");
                expect(res.status).to.be.equal(200);
            })
            .catch(function (err) {
                // some logging here please!
                Log.info(err);
                expect.fail();
            });
    });

    // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
