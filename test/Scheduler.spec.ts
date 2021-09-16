import Log from "../src/Util";
import Scheduler from "../src/scheduler/Scheduler";
import {SchedRoom} from "../src/scheduler/IScheduler";
import {expect} from "chai";

describe("Scheduler", function () {

    let sections = [
        {
            courses_dept: "cpsc",
            courses_id: "340",
            courses_uuid: "1319",
            courses_pass: 101,
            courses_fail: 7,
            courses_audit: 2
        },
        {
            courses_dept: "cpsc",
            courses_id: "340",
            courses_uuid: "3397",
            courses_pass: 171,
            courses_fail: 3,
            courses_audit: 1
        },
        {
            courses_dept: "cpsc",
            courses_id: "344",
            courses_uuid: "62413",
            courses_pass: 93,
            courses_fail: 2,
            courses_audit: 0
        },
        {
            courses_dept: "cpsc",
            courses_id: "344",
            courses_uuid: "72385",
            courses_pass: 43,
            courses_fail: 1,
            courses_audit: 0
        }
    ];
    let rooms: SchedRoom[] = [
        {
            rooms_shortname: "AERL",
            rooms_number: "120",
            rooms_seats: 144,
            rooms_lat: 49.26372,
            rooms_lon: -123.25099
        },
        {
            rooms_shortname: "ALRD",
            rooms_number: "105",
            rooms_seats: 94,
            rooms_lat: 49.2699,
            rooms_lon: -123.25318
        },
        {
            rooms_shortname: "ANGU",
            rooms_number: "098",
            rooms_seats: 260,
            rooms_lat: 49.26486,
            rooms_lon: -123.25364
        },
        {
            rooms_shortname: "BUCH",
            rooms_number: "A101",
            rooms_seats: 275,
            rooms_lat: 49.26826,
            rooms_lon: -123.25468
        }
    ];
    const expected = [
        [
            {
                rooms_lat: 49.26826,
                rooms_lon: -123.25468,
                rooms_number: "A101",
                rooms_seats: 275,
                rooms_shortname: "BUCH"
            },
            {
                courses_audit: 1,
                courses_dept: "cpsc",
                courses_fail: 3,
                courses_id: "340",
                courses_pass: 171,
                courses_uuid: "3397"
            },
            "MWF 0800-0900"
        ],
            [
            {
                rooms_lat: 49.26826,
                rooms_lon: -123.25468,
                rooms_number: "A101",
                rooms_seats: 275,
                rooms_shortname: "BUCH"
            },
        {
            courses_audit: 2,
            courses_dept: "cpsc",
            courses_fail: 7,
            courses_id: "340",
            courses_pass: 101,
            courses_uuid: "1319"
        },
        "MWF 0900-1000"
    ],
        [
        {
            rooms_lat: 49.26826,
            rooms_lon: -123.25468,
            rooms_number: "A101",
            rooms_seats: 275,
            rooms_shortname: "BUCH"
        },
    {
        courses_audit: 0,
        courses_dept: "cpsc",
        courses_fail: 2,
        courses_id: "344",
        courses_pass: 93,
        courses_uuid: "62413"
    },
    "MWF 1000-1100"
],
    [
        {
            rooms_lat: 49.26826,
            rooms_lon: -123.25468,
            rooms_number: "A101",
            rooms_seats: 275,
            rooms_shortname: "BUCH"
        },
        {
            courses_audit: 0,
            courses_dept: "cpsc",
            courses_fail: 1,
            courses_id: "344",
            courses_pass: 43,
            courses_uuid: "72385"
        },
        "MWF 1100-1200"
    ]
];
    let scheduler: Scheduler;

    beforeEach(function () {
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs before each test, which should make each test independent from the previous one
        Log.test(`BeforeTest: ${this.currentTest.title}`);
        try {
            scheduler = new Scheduler();
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

    it("Should add a valid dataset", function () {
        let result = scheduler.schedule(sections, rooms);
        expect(result).to.deep.equal(expected);
    });
});
