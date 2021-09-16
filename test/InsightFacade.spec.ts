import {expect} from "chai";
import * as fs from "fs-extra";
import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";

// This should match the schema given to TestUtil.validate(..) in TestUtil.readTestQueries(..)
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any;  // make any to allow testing structurally invalid queries
    isQueryValid: boolean;
    result: any;
    filename: string;  // This is injected when reading the file
}

describe("InsightFacade Add/Remove Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the 'before' hook.
    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        newCourses: "./test/data/newCourses.zip",
        newCourses2: "./test/data/newCourses2.zip",
        empty: "./test/data/empty.zip",
        notCourse: "./test/data/notCourse.zip",
        notJSON: "./test/data/notJSON.zip",
        txt: "./test/data/txt.txt",
        wrong: "./test/data/wrong.zip",
        pdf: "./test/data/pdf.zip",
        rooms: "./test/data/rooms.zip"
    };
    let datasets: { [id: string]: string } = {};
    let insightFacade: InsightFacade;
    const cacheDir = __dirname + "/../data";

    before(function () {
        // This section runs once and loads all datasets specified in the datasetsToLoad object
        // into the datasets object
        Log.test(`Before all`);
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs.readFileSync(datasetsToLoad[id]).toString("base64");
        }
    });

    beforeEach(function () {
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs before each test, which should make each test independent from the previous one
        Log.test(`BeforeTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // This is a unit test. You should create more like this!
    it("Should add a valid dataset", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });
    });

    it("Should add a valid room dataset", function () {
        const id: string = "rooms";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((result: string[]) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            Log.trace(err);
            expect.fail(err, expected, "Should not have rejected");
        });
    });

    it("adding a rooms and a courses", function () {
        const id1: string = "rooms";
        const id2: string = "courses";
        const expected: string[] = [id1, id2];
        return insightFacade.addDataset(id1, datasets[id1], InsightDatasetKind.Rooms).then(() => {
            return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
        })
            .then((result: string[]) => {
                expect(result).to.deep.equal(expected);
            })
            .catch((err: any) => {
                expect.fail(err, expected, "Should not have rejected");
            });
    });

    it("adding a valid data set with duplicate", function () {
        const id1: string = "newCourses";
        const id2: string = "courses";
        const expected: string[] = [id1, id2];
        return insightFacade.addDataset(id1, datasets[id1], InsightDatasetKind.Courses).then(() => {
            return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
        })
            .then((result: string[]) => {
                expect(result).to.deep.equal(expected);
            })
            .catch((err: any) => {
                expect.fail(err, expected, "Should not have rejected");
            });
    });

    it("adding a valid data set with no duplicates", function () {
        const id1: string = "newCourses";
        const id2: string = "newCourses2";
        const expected: string[] = [id1, id2];
        return insightFacade.addDataset(id1, datasets[id1], InsightDatasetKind.Courses).then(() => {
            return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
        }).then((result: string[]) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });
    });

    it("Null", function () {
        const id: string = null;
        const expected: string[] = [];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then(() => {
            return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        }).then((result: string[]) => {
            expect.fail(result, expected, "Should have err.");
        }).catch((err: any) => {
            expect(err).to.be.a.instanceOf(InsightError);
        });
    });

    it("Undefined", function () {
        const id: string = undefined;
        const expected: string[] = [];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then(() => {
            return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        }).then((result: string[]) => {
            expect.fail(result, expected, "Should have err.");
        }).catch((err: any) => {
            expect(err).to.be.a.instanceOf(InsightError);
        });
    });
    // Duplicate dataset
    it("Duplicate IDs - expect InsightError", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then(() => {
            return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        }).then((result: string[]) => {
            expect.fail(result, expected, "Should not have rejected");
        }).catch((err: any) => {
            expect(err).to.be.a.instanceOf(InsightError);
        });
    });

    it("All Duplicate courses-- valid ", function () {
        const id1: string = "courses";
        const id2: string = "newCourses";
        const expected: string[] = [id1, id2];
        return insightFacade.addDataset(id1, datasets[id1], InsightDatasetKind.Courses).then(() => {
            return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
        }).then((result: string[]) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should have rejected");
        });
    });

    // empty dataset
    it("Empty DataSet - expect InsightError", function () {
        const id: string = "empty";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail(result, expected, "Should have rejected");
        }).catch((err: any) => {
            expect(err).to.be.a.instanceOf(InsightError);
        });
    });

    // file name wrong
    it("File name inside is wrong - expect InsightError", function () {
        const id: string = "wrong";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail(result, expected, "Should have rejected");
        }).catch((err: any) => {
            expect(err).to.be.a.instanceOf(InsightError);
        });
    });

    // white space ID
    it("White Space ID", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade.addDataset(" ", datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail(result, expected, "Should have rejected");
        }).catch((err: any) => {
            expect(err).to.be.a.instanceOf(InsightError);
        });
    });

    // underscore in ID
    it("Underscore ID", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade.addDataset("_", datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail(result, expected, "Should have rejected");
        }).catch((err: any) => {
            expect(err).to.be.a.instanceOf(InsightError);
        });
    });

    it("not a valid course", function () {
        const id: string = "notCourse";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail(result, expected, "Should have rejected");
        }).catch((err: any) => {
            expect(err).to.be.a.instanceOf(InsightError);
        });
    });

    it("not valid json", function () {
        const id: string = "notJSON";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail(result, expected, "Should have rejected");
        }).catch((err: any) => {
            expect(err).to.be.a.instanceOf(InsightError);
        });
    });

    it("not zip file", function () {
        const id: string = "txt";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail(result, expected, "Should have rejected");
        }).catch((err: any) => {
            expect(err).to.be.a.instanceOf(InsightError);
        });
    });

    it("courses with PDF", function () {
        const id: string = "pdf";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should have rejected");
        });
    });

    it("Should remove a valid dataset", function () {
        const id: string = "courses";
        const expected: string = id;
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then(() => {
            return insightFacade.removeDataset(id);
        }).then((result: string) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });
    });

    it("Should remove a valid rooms", function () {
        const id: string = "rooms";
        const expected: string = id;
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then(() => {
            return insightFacade.removeDataset(id);
        }).then((result: string) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });
    });

    it("remove non existent after adding", function () {
        const id: string = "courses";
        const expected: string = id;
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then(() => {
            return insightFacade.removeDataset("abc");
        }).then((result: string) => {
            expect.fail(result, expected, "Should have rejected");
        }).catch((err: any) => {
            expect(err).to.be.a.instanceOf(NotFoundError);
        });
    });

    it("remove non existent data set", function () {
        const id: string = "courses";
        const expected: string = id;
        return insightFacade.removeDataset(id).then((result: string) => {
            expect.fail(result, expected, "Should have rejected");
        }).catch((err: any) => {
            expect(err).to.be.a.instanceOf(NotFoundError);
        });
    });

    it("remove dataset with _ ", function () {
        const id: string = "courses";
        const expected: string = id;
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then(() => {
            return insightFacade.removeDataset("a_b");
        }).then((result: string) => {
            expect.fail(result, expected, "Should have rejected");
        }).catch((err: any) => {
            expect(err).to.be.a.instanceOf(InsightError);
        });
    });

    it("remove dataset with white space ", function () {
        const id: string = "courses";
        const expected: string = id;
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then(() => {
            return insightFacade.removeDataset(" ");
        }).then((result: string) => {
            expect.fail(result, expected, "Should have rejected");
        }).catch((err: any) => {
            expect(err).to.be.a.instanceOf(InsightError);
        });
    });

    it("listDataSets empty ", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade.listDatasets().then((insightDatasets: InsightDataset[]) => {
            expect(insightDatasets.length).to.deep.equal(0);
        }).catch((err: any) => {
            expect.fail(err, expected, "should not have rejected");
        });
    });

    it("create a list ", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        const courses: InsightDataset = {
            id: id,
            numRows: 64612,
            kind: InsightDatasetKind.Courses
        } as InsightDataset;
        return insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
                expect(result).to.deep.equal(expected);
                return insightFacade.listDatasets().then((insightDatasets: InsightDataset[]) => {
                    expect(insightDatasets[0]).to.deep.equal(courses);
                }).catch((err: any) => {
                    expect.fail(err, expected, "should not have rejected");
                });
            }).catch((err: any) => {
                expect.fail(err, expected, "should not have rejected");
            });
    });

    it("create a list with rooms", function () {
        const id: string = "rooms";
        const expected: string[] = [id];
        const courses: InsightDataset = {
            id: id,
            numRows: 364,
            kind: InsightDatasetKind.Rooms
        } as InsightDataset;
        return insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((result: string[]) => {
                expect(result).to.deep.equal(expected);
                return insightFacade.listDatasets().then((insightDatasets: InsightDataset[]) => {
                    expect(insightDatasets[0]).to.deep.equal(courses);
                }).catch((err: any) => {
                    expect.fail(err, expected, "should not have rejected");
                });
            }).catch((err: any) => {
                expect.fail(err, expected, "should not have rejected");
            });
    });

});

/*
 * This test suite dynamically generates tests from the JSON files in test/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: { [id: string]: { path: string, kind: InsightDatasetKind } } = {
        courses: {path: "./test/data/courses.zip", kind: InsightDatasetKind.Courses},
        rooms: {path: "./test/data/rooms.zip", kind: InsightDatasetKind.Rooms}
};
    let insightFacade: InsightFacade;
    let testQueries: ITestQuery[] = [];

    // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
    before(function () {
        Log.test(`Before: ${this.test.parent.title}`);

        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = TestUtil.readTestQueries();
        } catch (err) {
            expect.fail("", "", `Failed to read one or more test queries. ${err}`);
        }

        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Will fail* if there is a problem reading ANY dataset.
        const loadDatasetPromises: Array<Promise<string[]>> = [];
        insightFacade = new InsightFacade();
        for (const id of Object.keys(datasetsToQuery)) {
            const ds = datasetsToQuery[id];
            const data = fs.readFileSync(ds.path).toString("base64");
            loadDatasetPromises.push(insightFacade.addDataset(id, data, ds.kind));
        }
        return Promise.all(loadDatasetPromises).catch((err) => {
            /* *IMPORTANT NOTE: This catch is to let this run even without the implemented addDataset,
             * for the purposes of seeing all your tests run.
             * TODO For C1, remove this catch block (but keep the Promise.all)
             */
            return Promise.resolve("HACK TO LET QUERIES RUN");
        });
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

// Dynamically create and run a test for each query in testQueries.
// Creates an extra "test" called "Should run test queries" as a byproduct.
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function (done) {
                    const resultChecker = TestUtil.getQueryChecker(test, done);
                    insightFacade.performQuery(test.query)
                        .then(resultChecker)
                        .catch(resultChecker);
                });
            }
        });
    });
});
