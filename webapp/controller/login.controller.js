sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	'sap/m/MessageToast'
], function (BaseController, JSONModel,MessageToast) {
	"use strict";

	return BaseController.extend("com.sap.manageFlp.controller.login", {
		onLogin:function(){
			let username = this.getView().byId("username").mProperties.value;
			let password = this.getView().byId("password").mProperties.value;
			let that = this;
			jQuery.get({
				type: "GET",  //specical CASE for avoding error in backend Node middleware error
                url: "http://124.222.52.43:3000/administratorLogin",
                headers:{
                    username:username,
					password:password
                },
                success:function(res){
                    if(res.length == 6){
						MessageToast.show(res)
					}else{
						that.getRouter().navTo("app",{
							username:JSON.parse(res).data[0].username
						});
					}					
                },
                datatype: "json"
			})
			// this.getRouter().navTo("app");
		}
	});
});