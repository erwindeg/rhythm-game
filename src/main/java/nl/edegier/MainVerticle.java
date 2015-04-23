package nl.edegier;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServer;
import io.vertx.core.http.HttpServerOptions;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.sockjs.BridgeOptions;
import io.vertx.ext.sockjs.SockJSServer;
import io.vertx.ext.sockjs.SockJSServerOptions;
import io.vertx.ext.sockjs.impl.RouteMatcher;

public class MainVerticle extends AbstractVerticle {

	private static final String PATH = "app";
	private static final String welcomePage = "index.html";

	@Override
	public void start() throws Exception {
		RouteMatcher matcher = getRouteMatcher();
		vertx.eventBus().consumer("shake", message -> System.out.println("shake: "+message.body()));
		vertx.eventBus().consumer("rhythm", message -> System.out.println("rhythm: "+message.body()));
		setUpServer(matcher).listen();
	}

	
	private HttpServer setUpServer(RouteMatcher matcher) {
		HttpServer server = vertx.createHttpServer(new HttpServerOptions().setPort(8080)).requestHandler(
				req -> matcher.accept(req));
		SockJSServer.sockJSServer(vertx, server).bridge(new SockJSServerOptions().setPrefix("/eventbus"),
				new BridgeOptions().addInboundPermitted(new JsonObject()).addOutboundPermitted(new JsonObject()));
		return server;

	}

	private RouteMatcher getRouteMatcher() {
		RouteMatcher matcher = RouteMatcher.routeMatcher().matchMethod(HttpMethod.GET, "/",
				req -> req.response().sendFile(PATH + "/" + welcomePage));
		matcher.matchMethod(HttpMethod.GET, "^\\/" + PATH + "\\/.*",
				req -> req.response().sendFile(req.path().substring(1)));
		return matcher;
	}
}
