sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"./BaseController",
	"sap/ui/core/Fragment"
], function (Controller, MessageToast,JSONModel,BaseController,Fragment) {
	"use strict";

	return BaseController.extend("sap.ui.demo.toolpageapp.controller.submitterJurisdiction", {
		onInit:async function(){
            let that = this;
            jQuery.get({     //save data local JSON file
                type: "GET",  //specical CASE for avoding error in backend Node middleware error
                url: "http://124.222.52.43:3000/getSubmitter",
                success:function(res){
                    let oModel = new JSONModel(JSON.parse(res).data);
                    that.getView().setModel(oModel,"submitter");
                },
                datatype: "json"
            })
		},

		onSearch:function(){

		},
		onPress : function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},
		_showObject : function (oItem) {
			this.getRouter().navTo("appList", {
				groupId: oItem.getBindingContext("cdm").getProperty("identification").id
			});
		},
        searchChange:function(event){
            this.searchString = encodeURIComponent(event.mParameters.newValue);
        },
        freesearch:function(){
            let that = this;
			jQuery.get({     //save data local JSON file
                type: "GET",  //specical CASE for avoding error in backend Node middleware error
                url: "http://124.222.52.43:3000/getSearchedSubmitter",
                headers:{
                    submittersearch:this.searchString
                },
                success:function(res){
                    let oModel = new JSONModel(JSON.parse(res).data);
                    that.getView().setModel(oModel,"submitter");
                },
                datatype: "json"
            })
        },
        onChangeSelect:function(event){
            let hospitalID = event.oSource.oParent.mAggregations.customData[0].mProperties.key;
            let submitterID = event.oSource.oParent.mAggregations.customData[1].mProperties.key;
            let manager = event.oSource.mProperties.selectedKey;
            jQuery.post({     //save data local JSON file
                type: "POST",  //specical CASE for avoding error in backend Node middleware error
                url: "http://124.222.52.43:3000/changeSubmitterManager",
                headers:{
                    hospitalid:hospitalID,
                    submitterid:submitterID,
                    manager:manager
                },
                success:function(res){
                    let oModel = new JSONModel(JSON.parse(res).data);
                    that.getView().setModel(oModel,"submitter");
                },
                datatype: "json"
            })
        }
	});
});