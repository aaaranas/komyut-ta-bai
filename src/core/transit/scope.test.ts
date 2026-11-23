import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getGraph, planJourney } from "@/core/planner";
import { edgesFrom } from "@/core/planner/graph";
import { getRoute, scopeOf, stopInScope, stops } from "@/core/transit/catalog";
import { METRO_CEBU_LGUS, inMetroCebu, lguKey } from "@/core/transit/scope";

const at = (municipality: string, lat = 10.3, lng = 123.9) => ({ municipality, lat, lng });

describe("Metro Cebu scope", () => {
  it("lists the 7 cities and 6 municipalities", () => {
    assert.equal(METRO_CEBU_LGUS.filter((l) => l.kind === "city").length, 7);
    assert.equal(METRO_CEBU_LGUS.filter((l) => l.kind === "municipality").length, 6);
  });

  it("matches LGU names however they are written", () => {
    assert.equal(lguKey("City of Naga"), "naga");
    assert.equal(lguKey("Naga City"), "naga");
    assert.ok(inMetroCebu(at("City of Naga")));
    assert.ok(inMetroCebu(at("Lapu-Lapu City")));
    assert.ok(inMetroCebu(at("Cordova")));
    assert.ok(!inMetroCebu(at("Argao", 9.88, 123.6)));
    assert.ok(!inMetroCebu(at("Santa Fe (Bantayan Island)", 11.16, 123.8)));
  });

  it("places a bare 'Cebu' label by its coordinates", () => {
    assert.ok(inMetroCebu(at("Cebu", 10.297, 123.905)));
    assert.ok(!inMetroCebu(at("Cebu", 11.2, 123.7)));
  });

  it("keeps every record but scopes the dataset", () => {
    assert.ok(stops.some((s) => s.id === "argao-terminal"), "records are not deleted");
    assert.ok(!stopInScope("argao-terminal"));
    assert.ok(stopInScope("csbt"));
    assert.equal(scopeOf(getRoute("ceres-argao-csbt")!), "partial");
    assert.equal(scopeOf(getRoute("ceres-cnbt-hagnaya")!), "partial");
    assert.equal(scopeOf(getRoute("ferry-hagnaya-santafe")!), "out");
    assert.equal(scopeOf(getRoute("ferry-danao-consuelo")!), "out");
  });

  it("routes only the Metro Cebu segments of a provincial route", () => {
    const graph = getGraph();
    assert.ok(!graph.stops.has("argao-terminal"));
    const fromCarcar = edgesFrom(graph, "carcar-rotunda").filter((e) => e.kind === "ride" && e.route_id === "ceres-argao-csbt");
    assert.ok(fromCarcar.some((e) => e.to === "naga"));
    assert.ok(!fromCarcar.some((e) => e.to === "sibonga"));
    const fromDanao = edgesFrom(graph, "danao-terminal").filter((e) => e.kind === "ride" && e.route_id === "ceres-cnbt-hagnaya");
    assert.ok(!fromDanao.some((e) => e.to === "carmen"));
    assert.equal(planJourney({ origin: "csbt", destination: "argao-terminal", preference: "fastest", depart: { dow: 2, minutes: 8 * 60 } }).status, "unknown_stop");
    assert.equal(planJourney({ origin: "csbt", destination: "carcar-rotunda", preference: "fastest", depart: { dow: 2, minutes: 8 * 60 } }).status, "ok");
  });
});
