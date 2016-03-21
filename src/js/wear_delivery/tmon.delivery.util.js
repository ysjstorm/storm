TMON.wearDelivery = TMON.wearDelivery || {};
TMON.wearDelivery.util = {

    /**
     * layer가 열렸을 때 Scroll 처리, layer=open 해시쿼리 추가
     */
    layerOpen : function (){
        TMON.wearDelivery.oHashbang.setState("",{"layer":"open"});
    },

    /**
     * hashchange event 가 발생할 때 상태값에 따라 이벤트 발생
     */
    checkHashQuerystring : function(){
        htHashState = TMON.wearDelivery.oHashbang.getState();

        if(htHashState.layer != 'open'){
            /* layer 닫기 */
            $('.ly_wrapper').hide();
        }
    }

}