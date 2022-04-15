sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"./BaseController",
	"sap/ui/core/Fragment"
], function (Controller, MessageToast,JSONModel,BaseController,Fragment) {
	"use strict";

	return BaseController.extend("sap.ui.demo.toolpageapp.controller.hospitalManage", {
		onInit:async function(){
            let that = this;
            jQuery.get({     //save data local JSON file
                type: "GET",  //specical CASE for avoding error in backend Node middleware error
                url: "http://124.222.52.43:3000/getHospital",
                success:function(res){
                    let oModel = new JSONModel(JSON.parse(res).data);
                    that.getView().setModel(oModel,"hospital");
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
                url: "http://124.222.52.43:3000/getSearchedHospital",
                headers:{
                    hospitalsearch:this.searchString
                },
                success:function(res){
                    let oModel = new JSONModel(JSON.parse(res).data);
                    that.getView().setModel(oModel,"hospital");
                },
                datatype: "json"
            })
        },
		onAdd:function(){
			if (!this._pNewHospitalLoaded) {
				this._pNewHospitalLoaded = sap.ui.core.Fragment.load({
					name: "sap.ui.demo.toolpageapp.view.hospitalAdd",
					id: "sap.ui.demo.toolpageapp.view.hospitalAdd",
					controller: this
				});
			}
			this._pNewHospitalLoaded.then(function (oDialog) {
				this._oAddHospitalDialog = oDialog;
				this.getView().addDependent(this._oAddHospitalDialog);
				oDialog.open();
			}.bind(this));
		},
		onSaveAdd:async function(){
			var hospitalName = Fragment.byId("sap.ui.demo.toolpageapp.view.hospitalAdd","hospitalName").getValue();
			if(!hospitalName){
				MessageToast.show("请输入完整信息!");
				return;
			}
            let that = this;
			jQuery.post({     //save data local JSON file
                type: "POST",  //specical CASE for avoding error in backend Node middleware error
                url: "http://124.222.52.43:3000/addHospital",
                headers:{
                    hospitalname:encodeURIComponent(hospitalName)
                },
                success:function(res){
					MessageToast.show("添加成功");
                    that._oAddHospitalDialog.close();
                    let oModel = new JSONModel(JSON.parse(res).data);
                    that.getView().setModel(oModel,"hospital");
                },
                datatype: "json"
            })
		},
		onCloseAddDialog:function(){
			this._oAddHospitalDialog.close();
		},
		onDelete:async function(){
			var oSelectedHospitals,DeletedHospitals = [];
			var oHospital;
			var DeletedHospital;
			oSelectedHospitals = this.byId("table").getSelectedItems();
			if(oSelectedHospitals.length){
				for(let i=0;i<oSelectedHospitals.length;i++){
					oHospital = oSelectedHospitals[i];
					DeletedHospital=oHospital.getBindingContext("hospital").getProperty("hospitalID");
					DeletedHospitals.push(DeletedHospital);
				}				
			}else{
				MessageToast.show("请至少选择一项!");
				return;
			}
            let that = this;
			jQuery.post({     //save data local JSON file
                type: "POST",  //specical CASE for avoding error in backend Node middleware error
                url: "http://124.222.52.43:3000/deleteHospital",
                headers:{
                    hospitalid:DeletedHospitals
                },
                success:function(res){
					MessageToast.show("删除成功");
                    let oModel = new JSONModel(JSON.parse(res).data);
                    that.getView().setModel(oModel,"hospital");
                },
                datatype: "json"
            })
		},
		onEdit:function(){
			var oSelectedHospital = this.byId("table").getSelectedItems();			
			if(oSelectedHospital.length>1){
				MessageToast.show("您只能选择一项!");
				return;
			}
			if(oSelectedHospital.length==0){
				MessageToast.show("请至少选择一项!");
				return;
			}
			this.editHospitalID = oSelectedHospital[0].getBindingContext("hospital").getProperty("hospitalID");
			let hospitals = this.getModel("hospital").oData;
            let that = this;
            let oModel = new JSONModel(hospitals.find(function(item){
                if(item.hospitalID == that.editHospitalID){
                    return item;
                }
            }));
            this.getView().setModel(oModel,"editHospital")
            if (!this._pEditHospitalLoaded) {
				this._pEditHospitalLoaded = sap.ui.core.Fragment.load({
					name: "sap.ui.demo.toolpageapp.view.hospitalEdit",
					id: "sap.ui.demo.toolpageapp.view.hospitalEdit",
					controller: this
				});
			}
			this._pEditHospitalLoaded.then(function (oDialog) {
				this._oEditHospitalDialog = oDialog;
				this.getView().addDependent(this._oEditHospitalDialog);
				oDialog.open();
			}.bind(this));
			
		},
		onCloseEditDialog:function(){
			this._oEditHospitalDialog.close();
		},
		onSaveEdit:async function(){
			var hospitalName = Fragment.byId("sap.ui.demo.toolpageapp.view.hospitalEdit","hospitalName").getValue();			
            let that = this;
			jQuery.post({     //save data local JSON file
                type: "POST",  //specical CASE for avoding error in backend Node middleware error
                url: "http://124.222.52.43:3000/editHospital",
                headers:{
                    hospitalid:that.editHospitalID,
                    hospitalname:encodeURIComponent(hospitalName)
                },
                success:function(res){
					MessageToast.show("编辑成功");
                    that._oEditHospitalDialog.close();
                    let oModel = new JSONModel(JSON.parse(res).data);
                    that.getView().setModel(oModel,"hospital");
                },
                datatype: "json"
            })
		}
	});

});