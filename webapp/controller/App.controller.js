sap.ui.define([
	'./BaseController',
	'sap/m/ResponsivePopover',
	'sap/m/MessagePopover',
	'sap/m/ActionSheet',
	'sap/m/Button',
	'sap/m/Link',
	'sap/m/NotificationListItem',
	'sap/m/MessagePopoverItem',
	'sap/ui/core/CustomData',
	'sap/m/MessageToast',
	'sap/ui/Device',
	'sap/ui/core/syncStyleClass',
	'sap/m/library',
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment"
], function(
	BaseController,
	ResponsivePopover,
	MessagePopover,
	ActionSheet,
	Button,
	Link,
	NotificationListItem,
	MessagePopoverItem,
	CustomData,
	MessageToast,
	Device,
	syncStyleClass,
	mobileLibrary,
	JSONModel,
	Fragment
) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.m.VerticalPlacementType
	var VerticalPlacementType = mobileLibrary.VerticalPlacementType;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	return BaseController.extend("sap.ui.demo.toolpageapp.controller.App", {

		_bExpanded: true,

		onInit: function() {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			// if the app starts on desktop devices with small or meduim screen size, collaps the sid navigation
			if (Device.resize.width <= 1024) {
				this.onSideNavButtonPress();
			}

			Device.media.attachHandler(this._handleWindowResize, this);
			this.getRouter().attachRouteMatched(this.onRouteChange.bind(this));

			var view = sap.ui.view({
                type: sap.ui.core.mvc.ViewType.XML,
                viewName: "sap.ui.demo.toolpageapp.view.Home"
            });
			var oScrollContainer = this.byId("app");
			var oCurrentView = oScrollContainer.getMainContents();
			oCurrentView[0].addPage(view);
		},

		onRouteChange:function(oEvent){
			let username = oEvent.getParameter("arguments").username;
			let that = this;
			jQuery.get({
				type: "GET",  //specical CASE for avoding error in backend Node middleware error
                url: "http://124.222.52.43:3000/getAdministrator",
                headers:{
                    username:username
                },
                success:function(res){
                    let oModel = new JSONModel(JSON.parse(res).data[0]);
                    that.getView().setModel(oModel,"administrator");
                },
                datatype: "json"
			})
		},

		// onRouteChange: function (oEvent) {
		// 	this.getModel('side').setProperty('/selectedKey', oEvent.getParameter('name'));

		// 	if (Device.system.phone) {
		// 		this.onSideNavButtonPress();
		// 	}
		// },

		onExit: function() {
			Device.media.detachHandler(this._handleWindowResize, this);
		},

		onUserNamePress: function(oEvent) {
			var oSource = oEvent.getSource();
			var oActionSheet = new ActionSheet(this.getView().createId("userMessageActionSheet"), {
				title: '设置',
				showCancelButton: false,
				buttons: [
					new Button({
						text: '用户设置',
						type: ButtonType.Transparent,
						press: this.onUserSetting
					}),
					new Button({
						text: '退出',
						type: ButtonType.Transparent,
						press: this.onLogout
					})
				],
				afterClose: function () {
					oActionSheet.destroy();
				}
			});
			this.getView().addDependent(oActionSheet);
			// forward compact/cozy style into dialog
			syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), oActionSheet);
			oActionSheet.openBy(oSource);
		},
		onUserSetting: function (oEvent) {
			let that = this.oParent.oParent.oParent.getController();
			if (!that._pUserSettingLoaded) {
				that._pUserSettingLoaded = Fragment.load({
					name: "sap.ui.demo.toolpageapp.view.userSetting",
					id: "sap.ui.demo.toolpageapp.view.userSetting",
					controller: that
				});
			}
			that._pUserSettingLoaded.then(function (oDialog) {
				that._oUserSettingDialog = oDialog;
				that.getView().addDependent(that._oUserSettingDialog);
				oDialog.open();
			}.bind(that));
		},
		onSaveUserSetting:function(){
			let username = Fragment.byId("sap.ui.demo.toolpageapp.view.userSetting","username").getText();
			let password = Fragment.byId("sap.ui.demo.toolpageapp.view.userSetting","password").getValue();
			let email = Fragment.byId("sap.ui.demo.toolpageapp.view.userSetting","email").getValue();
			if(!password){
				MessageToast.show("请输入必要信息！");
				return;
			}
			let that = this;
			jQuery.post({
				type: "POST",  //specical CASE for avoding error in backend Node middleware error
                url: "http://124.222.52.43:3000/editAdministrator",
                headers:{
                    username:username,
					password:password,
					email:email
                },
                success:function(res){
					that._oUserSettingDialog.close();
                    let oModel = new JSONModel(JSON.parse(res).data[0]);
                    that.getView().setModel(oModel,"administrator");
                },
                datatype: "json"
			})
		},
		onCloseUserSetting:function(){
			this._oUserSettingDialog.close();
		},
		onLogout: function (oEvent) {
			let that = this.oParent.oParent.oParent.getController();
			that.getRouter().navTo("login");
		},
		onSideNavButtonPress: function() {
			var oToolPage = this.byId("app");
			var bSideExpanded = oToolPage.getSideExpanded();
			this._setToggleButtonTooltip(bSideExpanded);
			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		},

		_setToggleButtonTooltip : function(bSideExpanded) {
			var oToggleButton = this.byId('sideNavigationToggleButton');
			this.getBundleText(bSideExpanded ? "expandMenuButtonText" : "collpaseMenuButtonText").then(function(sTooltipText){
				oToggleButton.setTooltip(sTooltipText);
			});
		},

		// Errors Pressed
		onMessagePopoverPress: function (oEvent) {
			var oMessagePopoverButton = oEvent.getSource();
			if (!this.byId("errorMessagePopover")) {
				this.getModel("i18n").getResourceBundle().then(function(oBundle){
					var oMessagePopover = new MessagePopover(this.getView().createId("errorMessagePopover"), {
						placement: VerticalPlacementType.Bottom,
						items: {
							path: 'alerts>/alerts/errors',
							factory: this._createError.bind(this, oBundle)
						},
						afterClose: function () {
							oMessagePopover.destroy();
						}
					});
					this.byId("app").addDependent(oMessagePopover);
					// forward compact/cozy style into dialog
					syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), oMessagePopover);
					oMessagePopover.openBy(oMessagePopoverButton);
				}.bind(this));
			}
		},

		/**
		 * Event handler for the notification button
		 * @param {sap.ui.base.Event} oEvent the button press event
		 * @public
		 */
		onNotificationPress: function (oEvent) {
			var oSource = oEvent.getSource();
			this.getModel("i18n").getResourceBundle().then(function(oBundle){
				// close message popover
				var oMessagePopover = this.byId("errorMessagePopover");
				if (oMessagePopover && oMessagePopover.isOpen()) {
					oMessagePopover.destroy();
				}
				var oButton = new Button({
					text: oBundle.getText("notificationButtonText"),
					press: function (oEvent) {
						MessageToast.show(oBundle.getText("clickHandlerMessage", [oEvent.getSource().getText()]));
					}
				});
				var oNotificationPopover = new ResponsivePopover(this.getView().createId("notificationMessagePopover"), {
					title: oBundle.getText("notificationTitle"),
					contentWidth: "300px",
					endButton : oButton,
					placement: PlacementType.Bottom,
					content: {
						path: 'alerts>/alerts/notifications',
						factory: this._createNotification.bind(this)
					},
					afterClose: function () {
						oNotificationPopover.destroy();
					}
				});
				this.byId("app").addDependent(oNotificationPopover);
				// forward compact/cozy style into dialog
				syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), oNotificationPopover);
				oNotificationPopover.openBy(oSource);
			}.bind(this));
		},

		/**
		 * Factory function for the notification items
		 * @param {string} sId The id for the item
		 * @param {sap.ui.model.Context} oBindingContext The binding context for the item
		 * @returns {sap.m.NotificationListItem} The new notification list item
		 * @private
		 */
		_createNotification: function (sId, oBindingContext) {
			var oBindingObject = oBindingContext.getObject();
			var oNotificationItem = new NotificationListItem({
				title: oBindingObject.title,
				description: oBindingObject.description,
				priority: oBindingObject.priority,
				close: function (oEvent) {
					var sBindingPath = oEvent.getSource().getCustomData()[0].getValue();
					var sIndex = sBindingPath.split("/").pop();
					var aItems = oEvent.getSource().getModel("alerts").getProperty("/alerts/notifications");
					aItems.splice(sIndex, 1);
					oEvent.getSource().getModel("alerts").setProperty("/alerts/notifications", aItems);
					oEvent.getSource().getModel("alerts").updateBindings("/alerts/notifications");
					this.getBundleText("notificationMessageDeleted").then(function(sMessageText){
						MessageToast.show(sMessageText);
					});
				}.bind(this),
				datetime: oBindingObject.date,
				authorPicture: oBindingObject.icon,
				press: function () {
					this.getModel("i18n").getResourceBundle().then(function(oBundle){
						MessageToast.show(oBundle.getText("notificationItemClickedMessage", oBindingObject.title));
					});
				},
				customData : [
					new CustomData({
						key : "path",
						value : oBindingContext.getPath()
					})
				]
			});
			return oNotificationItem;
		},

		_createError: function (oBundle, sId, oBindingContext) {
			var oBindingObject = oBindingContext.getObject();
			var oLink = new Link("moreDetailsLink", {
				text: oBundle.getText("moreDetailsButtonText"),
				press: function(oEvent) {
					this.getBundleText("clickHandlerMessage", [oEvent.getSource().getText()]).then(function(sClickHandlerMessage){
						MessageToast.show(sClickHandlerMessage);
					});
				}.bind(this)
			});

			var oMessageItem = new MessagePopoverItem({
				title: oBindingObject.title,
				subtitle: oBindingObject.subTitle,
				description: oBindingObject.description,
				counter: oBindingObject.counter,
				link: oLink
			});
			return oMessageItem;
		},

		/**
		 * Returns a promises which resolves with the resource bundle value of the given key <code>sI18nKey</code>
		 *
		 * @public
		 * @param {string} sI18nKey The key
		 * @param {string[]} [aPlaceholderValues] The values which will repalce the placeholders in the i18n value
		 * @returns {Promise<string>} The promise
		 */
		getBundleText: function(sI18nKey, aPlaceholderValues){
			return this.getBundleTextByModel(sI18nKey, this.getOwnerComponent().getModel("i18n"), aPlaceholderValues);
		},

		_handleWindowResize: function (oDevice) {
			if ((oDevice.name === "Tablet" && this._bExpanded) || oDevice.name === "Desktop") {
				this.onSideNavButtonPress();
				// set the _bExpanded to false on tablet devices
				// extending and collapsing of side navigation should be done when resizing from
				// desktop to tablet screen sizes)
				this._bExpanded = (oDevice.name === "Desktop");
			}
		},
		onSelect:function(oEvent){
			let name = oEvent.oSource.mProperties.key;
			var view = sap.ui.view({
                type: sap.ui.core.mvc.ViewType.XML,
                viewName: "sap.ui.demo.toolpageapp.view."+name
            });
			var oScrollContainer = this.byId("app");
			var oCurrentView = oScrollContainer.getMainContents();
			oCurrentView[0].removeAllPages();
			oCurrentView[0].addPage(view);
		}
	});
});