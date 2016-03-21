var hotelDealDetailOption = function(aStartDate, aEndDate, sRoomGroupList){
    this.sRoomGroupList = sRoomGroupList;
    this.aStartDate = aStartDate;
    this.aEndDate = aEndDate;

    this.init();
};

hotelDealDetailOption.prototype = {
    nTotalRooms : null,
    arrivalDate : null,
    departureDate : null,
    roomGroupList : null,
    bSaveCancel : null,
    bIsCheckInCalendarShow : false,
    bIsCheckOutCalendarShow : false,

    init : function(){
        this.nTotalRooms = 1;

        this.cacheElement();
        this.setEvent();
        this.assignTemplate();

        // 쿠키가 있으면 기본값을 변경
        this.assignCookieData();

        this.initCalendar();
    },

    cacheElement : function(){
        this.welBody = $('body');

        // Calendar
        this.welCalendar = $("#chk_in_calendar");
        this.welDisplayCheckIn = $("#_btnCheckIn input.date");
        this.welDisplayCheckOut = $("#_btnCheckOut input.date");
        this.welCheckInWrap = $(".chk_in");
        this.welCheckOutWrap = $(".chk_out");
        this.welBtnCheckInDiv = $("#_btnCheckIn");
        this.welBtnCheckOutDiv = $("#_btnCheckOut");
        this.welBtnCheckIn = this.welBtnCheckInDiv.find("button.btn_cal_toggle");
        this.welBtnCheckOut = this.welBtnCheckOutDiv.find("button.btn_cal_toggle");
        this.welInCalWrap = $("#_checkInCalendarWrap");
        this.welOutCalWrap = $("#_checkOutCalendarWrap");

        // Option
        this.welContainer = $('#roomSearchOptions');
        this.welRooms = $("#_selectRooms");
        this.welRoomOptionsContainer = $("#_roomOptions");
        this.welSelectRooms = this.welRooms.find("select.slt");
        this.welBtnIncreasePerson = $(".slt-pm-btn.plus");
        this.welBtnDecreasePerson = $(".slt-pm-btn.minus");

        this.welBtnSave = $("#_btnSave");
    },

    setEvent : function(){
        this.welSelectRooms.on("change", $.proxy(this.onChangeRooms, this));
        this.welContainer.on("click", ".slt-pm-btn.plus", $.proxy(this.onClickBtnIncreasePerson, this));
        this.welContainer.on("click", ".slt-pm-btn.minus", $.proxy(this.onClickBtnDecreasePerson, this));
        this.welContainer.on("change", ".slt-num[name*=child-num]", $.proxy(this.onChangeChild, this));

        this.welBtnSave.click($.proxy(this.onClickBtnSave, this));
        this.welBody.click($.proxy(this.onClickBody, this));
    },

    onClickBody : function(e){
        this.hideCheckInCal();
        this.hideCheckOutCal();
    },

    initCalendar : function(){
        this.welBtnCheckInDiv.click($.proxy(this.onClickCalendarCheckIn, this));
        this.welBtnCheckOutDiv.click($.proxy(this.onClickCalendarCheckOut, this));

        this.oCal = new tmonCalendar({
            welLayer : this.welCalendar, // 칼렌더 레이어
            welCal : this.welCalendar.find("div.month_wrap"), // 개별 달력을 감싸고 있는 엘리먼트, 2개 이상의 칼렌더가 나올 수도 있다.
            sDayCellSeletor : ".cal_date_list li", // 날짜 Cell을 선택하기 위한 셀렉터
            sDayTextSelector : ".date", // 날짜 Cell에 날짜의 숫자가 입력되는 엘리먼트의 셀렉터
            welBtnPrev : this.welCalendar.find(".btn_last"), // 이전달 버튼
            welBtnNext : this.welCalendar.find(".btn_next"), // 다음달 버튼

            sDisabledClass : "past", // 오늘 이전의 날짜를 선택할 수 없을때 추가하는 클래스
            sSaturdayClass : "wkd sat", // 토요일에 추가하는 클래스
            sSundayClass : "wkd sun", // 일요일에 추가하는 클래스
            sHolidayClass : "wkd sun", // 공휴일에 추가하는 클래스
            sHoverDayClass : "", // 마우스 오버시에 추가되는 클래스
            sTodayClass : "", // 오늘 날짜에 추가되는 클래스
            sStartClass : "chk_in_day", // 선택된 시작 날짜 클래스
            sBetweenClass : "stay_in", // 선택된 시작, 끝 날짜 사이의 클래스
            sEndClass : "chk_out_day", // 선택된 끝 날짜 클래스
            sOneDayClass : "one_day", // 1박2일일 경우 시작 날짜에 추가되는 클래스

            sDisplayYearMonthClass : "_yearMonth", // 년,월 표시되는 엘리먼트의 클래스
            nStartNEndDateGap : 2, // 시작날짜 와 끝날짜 사이의 최소 갭
            nMaxAvailableDays : 499, // 오늘부터 x일까지만 선택 가능
            nMaxReservableDays : 28, // 예약가능한 최대 기간(박수)
            nSelectableStartDayFromToday : 0, // 오늘부터 x일 이후에 선택 가능
            bDisableOverMaxReservableDays : true,
            aStartDate : this.aStartDate,
            aEndDate: this.aEndDate,
            bEnableMouseoverAction:false,

            afterSelect : $.proxy(function(oThis, bIsPickStart, aStartDate, aEndDate, nDays, bShowEndDateSelector){ // 날짜 선택 후 실행되는 함수
                this.welDisplayCheckIn.val(this.getFormatedDate(aStartDate));
                this.welDisplayCheckOut.val(this.getFormatedDate(aEndDate));

                this.hideCheckInCal();
                this.hideCheckOutCal();
                oThis.hide();

                if(bShowEndDateSelector){
                    this.showCheckoutCalendar(false);
                }
            },this)
        });
    },

    onClickCalendarCheckIn : function(){
        this.showCheckinCalendar();
        return false;
    },

    onClickCalendarCheckOut : function(){
        this.showCheckoutCalendar(true);
        return false;
    },

    showCheckinCalendar : function(){
        if(this.bIsCheckInCalendarShow){
            this.hideCheckInCal();
            return false;
        }

        this.oCal.setPickStart(); // 체크 인 날짜 선택하게 셋팅
        this.oCal.setCurrentDisplayYearMonth(this.oCal.aStartDate[0], this.oCal.aStartDate[1]); // 체크 아웃이 선택된 달의 날짜로 달력을 그려주게 셋팅
        this.welCalendar.appendTo(this.welInCalWrap); // 하나의 달력으로 체크아웃/인을 같이 사용하기 떄문에 위치를 옴겨준다.
        this.welBtnCheckIn.addClass("on");
        this.welCheckInWrap.addClass("on");
        this.welCheckOutWrap.removeClass("on");
        this.welBtnCheckOut.removeClass("on");
        this.bIsCheckInCalendarShow = true;
        this.bIsCheckOutCalendarShow = false;
        this.oCal.show();

        return false;
    },

    hideCheckInCal : function(){
        this.welCheckInWrap.removeClass("on");
        this.welBtnCheckIn.removeClass("on");
        this.bIsCheckInCalendarShow = false;
        this.oCal.hide();
    },

    showCheckoutCalendar : function(bShowCheckInDateInDisplay){
        if(this.bIsCheckOutCalendarShow){
            this.hideCheckOutCal();
            return false;
        }

        this.oCal.setPickEnd(); // 체크 아웃 날짜 선택하게 셋팅
        this.oCal.setCurrentDisplayYearMonth(this.oCal.aEndDate[0], this.oCal.aEndDate[1]); // 체크 아웃이 선택된 달의 날짜로 달력을 그려주게 셋팅
        this.welCalendar.appendTo(this.welOutCalWrap); // 하나의 달력으로 체크아웃/인을 같이 사용하기 떄문에 위치를 옴겨준다.
        this.welBtnCheckIn.removeClass("on");
        this.welCheckInWrap.removeClass("on");
        this.welCheckOutWrap.addClass("on");
        this.welBtnCheckOut.addClass("on");
        this.bIsCheckInCalendarShow = false;
        this.bIsCheckOutCalendarShow = true;
        this.oCal.show(bShowCheckInDateInDisplay);

        return false;
    },

    hideCheckOutCal : function(){
        this.welBtnCheckOut.removeClass("on");
        this.welCheckOutWrap.removeClass("on");
        this.bIsCheckOutCalendarShow = false;
        this.oCal.hide();
    },

    getFormatedDate : function(aDate){
        var aDay = ["일", "월", "화", "수", "목", "금", "토"];
        var oDate = new Date(aDate[0], aDate[1]-1, aDate[2]);
        var result = [];

        result.push(aDate[0]);
        result.push((aDate[1].length > 1 || aDate[1] > 9)? aDate[1] : '0'+aDate[1]);
        result.push((aDate[2].length > 1 || aDate[2] > 9)? aDate[2] : '0'+aDate[2]);

        return result[0] + "년 " + result[1] + "월 " + result[2] + "일 " + aDay[oDate.getDay()] + "요일";

    },

    /*
     * 객실수 변경
     */
    onChangeRooms : function(){
        var nSelectedTotalRooms = parseInt(this.welSelectRooms.val(), 10);
        var nRoomToChange = nSelectedTotalRooms - this.nTotalRooms;

        if(nRoomToChange > 0){
            this.increaseRoom(nRoomToChange);
        }else if(nRoomToChange < 0){
            nRoomToChange = this.nTotalRooms - nSelectedTotalRooms;
            this.decreaseRoom(nRoomToChange);
        }

        this.nTotalRooms = nSelectedTotalRooms;
    },

    /*
     * 객실 추가
     * @param {number} nRoomsToIncrease - 증가시킬 방 수
     */
    increaseRoom : function(nRoomsToIncrease){
        var welCurrentRooms = this.welRoomOptionsContainer.find(".room-option");
        var nCurrentRooms = welCurrentRooms.length;
        var nRoomOrder;
        var i;

        for(i = 1; i <= nRoomsToIncrease; i += 1){
            nRoomOrder = nCurrentRooms + i;

            $.tmpl("roomOption", {
                nRoomOrder: nRoomOrder
            }).appendTo(this.welRoomOptionsContainer);
        }
    },

    /*
     * 객실 제거
     * @param {number} nRoomsToDecrease - 감소시킬 방 수
     */
    decreaseRoom : function(nRoomsToDecrease){
        var welCurrentRooms = this.welRoomOptionsContainer.find(".room-option");
        var nCurrentRooms = welCurrentRooms.length;
        var nRoomOrder;
        var nIndexToRemove;
        var welRoomToRemove;
        var i;

        for(i = 1; i <= nRoomsToDecrease; i += 1){
            nIndexToRemove = nCurrentRooms - i;
            welRoomToRemove = $(welCurrentRooms[nIndexToRemove]);
            welRoomOrder = welRoomToRemove.prev('.room-num');

            welRoomOrder.remove();
            welRoomToRemove.remove();
        }
    },

    /*
     * 인원증가 버튼 클릭
     * @param {MouseEvent} we
     */
    onClickBtnIncreasePerson : function(we){
        var welBtn = $(we.currentTarget);
        var welSelect = welBtn.parent(".slt-num-wp").find(".slt-num");
        var welOption = welSelect.find("option");
        var nOptionIndex = welOption.index(welSelect.find("option:selected")) + 1;

        // 마지막 option 값까지 option 변경
        if(nOptionIndex < welOption.length){
            welSelect.find("option:selected").prop("selected", false).next("option").prop("selected", true);
            welSelect.trigger("change");
        }
    },

    /*
     * 인원감소 버튼 클릭
     * @param {MouseEvent} we
     */
    onClickBtnDecreasePerson : function(we){
        var welBtn = $(we.currentTarget);
        var welSelect = welBtn.parent(".slt-num-wp").find(".slt-num");
        var welOption = welSelect.find("option");
        var nOptionIndex = welOption.index(welSelect.find("option:selected")) + 1;

        // 첫번째 option 값까지 option 변경
        if(nOptionIndex > 1){
            welSelect.find("option:selected").prop("selected", false).prev("option").prop("selected", true);
            welSelect.trigger("change");
        }
    },

    /*
     * 아동 인원 셀렉트박스 변경시 처리
     * @param {ChangeEvent} we
     */
    onChangeChild : function(we){
        var welSelect = $(we.currentTarget);
        var welSelectWrap = welSelect.closest('.people-select');
        var nTotalChild = welSelectWrap.find('.age-select').length;
        var nSelectedChild = parseInt(welSelect.val(), 10);
        var nChildToChange = nSelectedChild - nTotalChild;

        if(nChildToChange > 0){
            this.increaseChild(welSelectWrap, nChildToChange);
        }else if(nChildToChange < 0){
            nChildToChange = nTotalChild - nSelectedChild;
            this.decreaseChild(welSelectWrap, nChildToChange);
        }
    },

    /*
     * 아동 인원 추가
     * @param {Element} wel - 상위 래퍼
     * @param {number} nChildToIncrease - 추가할 인원 수
     */
    increaseChild : function(wel, nChildToIncrease){
        var welCurrentRooms = this.welRoomOptionsContainer.find(".room-option");
        var welTargetRoom = wel.parent(".room-option");
        var nRoomOrder = welCurrentRooms.index(welTargetRoom) + 1;
        var nTotalChildren = wel.find(".age-select").length;
        var nChildOrder;
        var i;

        for(i = 0; i < nChildToIncrease; i += 1){
            nChildOrder = nTotalChildren + (i + 1);

            $.tmpl("roomChildAge", {
                nRoomOrder : nRoomOrder,
                nChildOrder : nChildOrder
            }).appendTo(wel);
        }
    },

    /*
     * 아동 인원 제거
     * @param {Element} wel - 상위 래퍼
     * @param {number} nChildToDecrease - 감소시킬 인원 수
     */
    decreaseChild : function(wel, nChildToDecrease){
        var welCurrentRooms = this.welRoomOptionsContainer.find(".room-option");
        var welTargetRoom = wel.parent(".room-option");
        var welCurrentChildren = wel.find(".age-select");
        var nTotalChildren = welCurrentChildren.length;
        var welTargetChildren;
        var nChildOrderToRemove;
        var i;

        for(i = 1; i <= nChildToDecrease; i += 1){
            nChildOrderToRemove = nTotalChildren - i;
            welTargetChildren = $(welCurrentChildren[nChildOrderToRemove]);

            welTargetChildren.remove();
        }
    },

    /*
     * 조건변경 버튼 클릭시 처리
     * 쿠키를 저장한 후 callApp으로 창을 닫으면 부모창이 새로고침된다
     */
    onClickBtnSave : function(){
        this.roomGroupList = this.getGuestOptions();
        this.arrivalDate = this.convertDateToString(this.oCal.aStartDate);
        this.departureDate = this.convertDateToString(this.oCal.aEndDate);

        if(this.bSaveCancel){
            return false;
        }

        this.setCookie();
        TMON.app.callApp('webview', 'closeWebView', true);
    },

    /*
     * 캘린더에 배열로 되어 있는 날짜를
     * 쿠키에 쓸 수 있게 문자열로 변경
     */
    convertDateToString : function(aDate){
        var aFormattedDate = [];

        aFormattedDate[0] = this.setLeadingZero(aDate[1]);
        aFormattedDate[1] = this.setLeadingZero(aDate[2]);
        aFormattedDate[2] = this.setLeadingZero(aDate[0]);

        return aFormattedDate.join("/");
    },

    /*
     * 날짜가 한자리 수 이면 앞에 0을 추가한다
     */
    setLeadingZero : function(n){
        if(n < 10){
            return "0" + n.toString();
        }else{
            return n.toString();
        }
    },

    /*
     * 투숙객 정보를 쿠키에 넘겨주기 위해서
     * 성인:아동나이1:아동나이2:아동나이3 형태로 변환
     */
    getGuestOptions : function(){
        var aAdult = this.getAdult();
        var oChildAge = this.getChildAge();
        var aRoomGroup = [];
        var aChildAge;
        var sRoomGroup;
        var sGuestOptions;
        var i;

        for(i = 0; i < aAdult.length; i += 1){
            aChildAge = oChildAge[i + 1];

            if(aChildAge){
                sRoomGroup = aAdult[i] + ":" + aChildAge.join(":");
            }else{
                sRoomGroup = aAdult[i];
            }

            aRoomGroup[i] = sRoomGroup.toString();
        }

        sGuestOptions = aRoomGroup.join(",");

        return sGuestOptions;
    },

    /*
     * 객실별 성인 인원을 받아서 배열로 돌려준다
     */
    getAdult : function(){
        var welRooms = this.welRoomOptionsContainer.find(".room-option");
        var welSelectAdult = welRooms.find("[name*=adult-num]");
        var aAdult = [];

        $.each(welSelectAdult, function(index, el){
            var nAdult = parseInt($(el).val(), 10);
            aAdult.push(nAdult);
        });

        return aAdult;
    },

    /*
     * 객실별 아동 나이를 받아서 객체로 돌려준다
     */
    getChildAge : function(){
        var welSelectChildAge = this.welRoomOptionsContainer.find(".slt[name*=child-age]");
        var oChildAge = {};
        var that = this;

        $.each(welSelectChildAge, function(index, el){
            var welSelectChildAge = $(el);
            var nChildAgeOrder = welSelectChildAge.attr("name").replace("child-age", "");
            var nRoomOrder = nChildAgeOrder[0];
            var nChildOrder = nChildAgeOrder[1] - 1;
            var nChildAge = parseInt(welSelectChildAge.val(), 10);

            if(!isNaN(nChildAge)){
                that.bSaveCancel = false;
                oChildAge[nRoomOrder] = oChildAge[nRoomOrder] || [];
                oChildAge[nRoomOrder][nChildOrder] = nChildAge;
            }else{
                that.bSaveCancel = true;
                alert("아동의 나이를 모두 입력해주세요.");
                return false;
            }
        });

        return oChildAge;
    },

    /*
     * 상세에서 쿠키를 생성하여 넘긴 경우 받아서 적용한다
     */
    assignCookieData : function(){
        // Cookie값이 null이 넘어오는 경우가 있어서 서버에서 내려주는 값으로 사용한다.
        var arrivalCookie = this.aStartDate; // TMON.util.getCookie("arrivalDate");
        var departureCookie = this.aEndDate; // TMON.util.getCookie("departureDate");
        var roomCookie = this.sRoomGroupList; // TMON.util.getCookie("roomGroupList");

        this.createRoomsByCookie(roomCookie);

        // if(arrivalCookie){
        //     this.aStartDate = this.parseDate(arrivalCookie);
        // }

        // if(departureCookie){
        //     this.aEndDate = this.parseDate(departureCookie);
        // }

        // if(roomCookie){
        //     this.createRoomsByCookie(roomCookie);
        // }
    },

    /*
     * 상세 리프레시 후 사용될 쿠키를 내림
     */
    setCookie : function(){
        TMON.util.setCookie("arrivalDate", this.arrivalDate, {path: "/"});
        TMON.util.setCookie("departureDate", this.departureDate, {path: "/"});
        TMON.util.setCookie("roomGroupList", this.roomGroupList, {path: "/"});
    },

    /*
     * 쿠키에 입력된 날짜 형태를 캘린더에 쓸 수 있게 변경
     */
    parseDate : function(sDate){
        var aDateString = sDate.split("/");
        var aDate = [];

        aDate[0] = parseInt(aDateString[2], 10);
        aDate[1] = parseInt(aDateString[0], 10);
        aDate[2] = parseInt(aDateString[1], 10);

        return aDate;
    },

    /*
     * 성인:아동나이1:아동나이2:아동나이3 형태로 입력된 쿠키를 받아서
     * 객실을 추가하고 성인, 아동을 추가한다
     */
    createRoomsByCookie : function(sRoomGroupList){
        var aRoomGroupList = sRoomGroupList.split(",");
        var nTotalRooms = aRoomGroupList.length;
        var welCurrentRooms;

        this.nTotalRooms = nTotalRooms;
        this.welSelectRooms.val(nTotalRooms);
        this.increaseRoom(nTotalRooms - 1);

        welCurrentRooms = this.welRoomOptionsContainer.find(".room-option");

        $.each(welCurrentRooms, function(index, el){
            var $el = $(el);
            var aRoomGroup = aRoomGroupList[index].split(":");
            var nAdultValue = parseInt(aRoomGroup[0], 10);
            var aChildAge = aRoomGroup.slice(1);
            var nChildValue = aChildAge.length;
            var welSelectAdult = $el.find(".slt-num[name*=adult-num]");
            var welSelectChild = $el.find(".slt-num[name*=child-num]");
            var welSelectChildAge;

            welSelectAdult.val(nAdultValue);
            welSelectChild.val(nChildValue);
            welSelectChild.trigger("change");

            welSelectChildAge = $el.find(".slt[name*=child-age]");

            $.each(welSelectChildAge, function(index, el){
                var $el = $(el);
                $el.val(aChildAge[index]);
            });
        });
    },

    assignTemplate : function(){
        // 객실
        $.template("roomOption",
            '<div class="room-num">객실 ${nRoomOrder}</div>' +
            '<div class="room-option">' +
                '<div class="people-select">' +
                    '<div class="input_uio">' +
                        '<label class="lbl" for="adult-num${nRoomOrder}">' +
                            '성인 <br>' +
                            '<span class="desc">만 18세 이상</span>' +
                        '</label>' +
                        '<div class="slt-num-wp">' +
                            '<button class="slt-pm-btn minus">' +
                                '<span>-</span>' +
                            '</button>' +
                            '<select class="slt-num" name="adult-num${nRoomOrder}" id="name="adult-num${nRoomOrder}">' +
                                '<option value="1">1</option>' +
                                '<option value="2" selected>2</option>' +
                                '<option value="3">3</option>' +
                                '<option value="4">4</option>' +
                                '<option value="5">5</option>' +
                                '<option value="6">6</option>' +
                                '<option value="7">7</option>' +
                                '<option value="8">8</option>' +
                            '</select>' +
                            '<button class="slt-pm-btn plus">' +
                                '<span>+</span>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="people-select">' +
                    '<div class="input_uio">' +
                        '<label class="lbl" for="child-num${nRoomOrder}">' +
                            '아동 <br>' +
                            '<span class="desc"> 만 17세 이하 </span>' +
                        '</label>' +
                        '<div class="slt-num-wp">' +
                            '<button class="slt-pm-btn minus">' +
                                '<span>-</span>' +
                            '</button>' +
                            '<select class="slt-num" name="child-num${nRoomOrder}" id="child-num${nRoomOrder}">' +
                                '<option value="0" selected>0</option>' +
                                '<option value="1">1</option>' +
                                '<option value="2">2</option>' +
                                '<option value="3">3</option>' +
                            '</select>' +
                            '<button class="slt-pm-btn plus">' +
                                '<span>+</span>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );

        // 아동 나이
        $.template("roomChildAge",
            '<div class="age-select input_uio">' +
            '<label class="lbl sub" for="child-age${nRoomOrder}${nChildOrder}">아동 ${nChildOrder} 나이</label>' +
            '<div class="slt-wp"><span class="slt-btn"><span class="arr"></span></span><select class="slt" name="child-age${nRoomOrder}${nChildOrder}" id="child-age${nRoomOrder}${nChildOrder}"><option value="0"> 만 0 세 </option><option value="1"> 만 1 세 </option><option value="2"> 만 2 세 </option><option value="3"> 만 3 세 </option><option value="4"> 만 4 세 </option><option value="5"> 만 5 세 </option><option value="6"> 만 6 세 </option><option value="7"> 만 7 세 </option><option value="8"> 만 8 세 </option><option value="9"> 만 9 세 </option><option value="10"> 만 10 세 </option><option value="11"> 만 11 세 </option><option value="12"> 만 12 세  </option><option value="13"> 만 13 세  </option><option value="14"> 만 14 세  </option><option value="15"> 만 15 세  </option><option value="16"> 만 16 세  </option><option value="17"> 만 17 세  </option></select></div>' +
            '</div>'
        );
    }
};
