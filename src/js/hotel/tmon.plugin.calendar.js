var tmonCalendar = function(htOptions){
    this._init(htOptions);
};

tmonCalendar.prototype = {
    welLayer : null, // 칼렌더 레이어
    welCal : null, // 개별 달력을 감싸고 있는 엘리먼트, 2개 이상의 칼렌더가 나올 수도 있다.
    sDayCellSeletor : "li", // 날짜 Cell을 선택하기 위한 셀렉터
    sDayTextSelector : ".date", // 날짜 Cell에 날짜의 숫자가 입력되는 엘리먼트의 셀렉터
    welBtnPrev : null, // 이전달 버튼
    welBtnNext : null, // 다음달 버튼
    welBtnClose : null, // 칼렌더 레이어 닫기 버튼

    sDisabledClass : "disabled", // 오늘 이전의 날짜를 선택할 수 없을때 추가하는 클래스
    sSaturdayClass : "saturday", // 토요일에 추가하는 클래스
    sSundayClass : "sunday", // 일요일에 추가하는 클래스
    sHolidayClass : "holiday", // 공휴일에 추가하는 클래스
    sHoverDayClass : "hoverDay", // 마우스 오버시에 추가되는 클래스
    sTodayClass : "", // 오늘 날짜에 추가되는 클래스
    sStartClass : "start", // 선택된 시작 날짜 클래스
    sBetweenClass : "between", // 선택된 시작, 끝 날짜 사이의 클래스
    sEndClass : "end", // 선택된 끝 날짜 클래스
    sOneDayClass : "oneday", // 1박2일일 경우 시작 날짜에 추가되는 클래스

    sDisplayYearMonthClass : "display", // 년,월 표시되는 엘리먼트의 클래스
    nStartNEndDateGap : 1, // 시작날짜 와 끝날짜 사이의 최소 갭
    nMaxAvailableDays : 499, // 오늘부터 x일까지만 선택 가능
    nMaxReservableDays : 100, // 예약가능한 최대 기간(박수)
    nSelectableStartDayFromToday : 0, // 오늘부터 x일 이후에 선택 가능
    bDisableOverMaxReservableDays : false,
    bDisableSelectDayBeforeStartDate : false, // true : 체크아웃 날짜 선택시 체크인 날짜 전 날짜 선택 불가능하게
    bEnableMouseoverAction : true, // 마우스 오버시 액션 추가

    afterInit : function(){}, // 처음 init가 완료되고 실행되는 함수
    afterSelect : function(){}, // 날짜 선택 후 실행되는 함수
    onAfterHover : function(){}, // 날짜 마우스 오버시 실행되는 함수

    aStartDate : [0, 0, 0], //[년, 월, 일] 선택된 시작 날짜
    aEndDate : [0, 0, 0], //[년, 월, 일] 선택된 마지막 날짜

    _aLunarMonthTable : [
        [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2],
        [2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 2, 1],
        [1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2], /* 1801 */
        [1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2, 1],
        [2, 3, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
        [1, 2, 1, 2, 1, 3, 2, 1, 2, 2, 2, 1],
        [2, 2, 1, 2, 1, 1, 1, 2, 1, 2, 2, 1],
        [2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
        [1, 2, 2, 1, 5, 2, 1, 2, 1, 1, 2, 1],
        [2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1, 2],
        [1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2],
        [1, 1, 5, 2, 1, 2, 2, 1, 2, 2, 1, 2], /* 1811 */
        [1, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1],
        [2, 1, 2, 1, 1, 1, 2, 1, 2, 2, 2, 1],
        [2, 5, 2, 1, 1, 1, 2, 1, 2, 2, 1, 2],
        [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2],
        [2, 2, 1, 2, 1, 5, 1, 2, 1, 2, 1, 2],
        [2, 1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1],
        [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2],
        [1, 2, 1, 5, 2, 2, 1, 2, 2, 1, 2, 1],
        [1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
        [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2], /* 1821 */
        [2, 1, 5, 1, 1, 2, 1, 2, 2, 1, 2, 2],
        [2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 2],
        [2, 1, 2, 1, 2, 1, 4, 1, 2, 1, 2, 2],
        [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
        [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 1, 2, 2, 4, 1, 2, 1, 2, 1, 2, 1],
        [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
        [1, 1, 2, 3, 2, 1, 2, 2, 1, 2, 2, 2],
        [1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2], /* 1831 */
        [1, 2, 1, 2, 1, 1, 2, 1, 5, 2, 2, 2],
        [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
        [1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
        [1, 2, 2, 1, 2, 5, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
        [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
        [1, 2, 1, 5, 1, 2, 2, 1, 2, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
        [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
        [1, 2, 4, 1, 1, 2, 1, 2, 1, 2, 2, 1],   /* 1841 */
        [2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1],
        [2, 2, 2, 1, 2, 1, 4, 1, 2, 1, 2, 1],
        [2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
        [2, 1, 2, 1, 5, 2, 1, 2, 2, 1, 2, 1],
        [2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
        [2, 1, 2, 3, 2, 1, 2, 1, 2, 1, 2, 2],
        [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
        [2, 2, 1, 2, 1, 1, 2, 3, 2, 1, 2, 2],   /* 1851 */
        [2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 1, 2],
        [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2],
        [1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
        [2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
        [1, 2, 1, 1, 5, 2, 1, 2, 1, 2, 2, 2],
        [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
        [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
        [2, 1, 6, 1, 1, 2, 1, 1, 2, 1, 2, 2],
        [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2],   /* 1861 */
        [2, 1, 2, 1, 2, 2, 1, 5, 2, 1, 1, 2],
        [1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
        [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 1, 2, 4, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
        [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
        [1, 2, 2, 3, 2, 1, 1, 2, 1, 2, 2, 1],
        [2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 2, 2, 1, 2, 1, 2, 1, 1, 5, 2, 1],
        [2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1, 2],   /* 1871 */
        [1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
        [1, 1, 2, 1, 2, 4, 2, 1, 2, 2, 1, 2],
        [1, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1],
        [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
        [2, 2, 1, 1, 5, 1, 2, 1, 2, 2, 1, 2],
        [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2],
        [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 2, 4, 2, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2],
        [1, 2, 1, 2, 1, 2, 5, 2, 2, 1, 2, 1],   /* 1881 */
        [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
        [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
        [2, 1, 1, 2, 3, 2, 1, 2, 2, 1, 2, 2],
        [2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
        [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
        [2, 2, 1, 5, 2, 1, 1, 2, 1, 2, 1, 2],
        [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
        [1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],   /* 1891 */
        [1, 1, 2, 1, 1, 5, 2, 2, 1, 2, 2, 2],
        [1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
        [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
        [2, 1, 2, 1, 5, 1, 2, 1, 2, 1, 2, 1],
        [2, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
        [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
        [2, 1, 5, 2, 2, 1, 2, 1, 2, 1, 2, 1],
        [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 2, 5, 2, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],   /* 1901 */
        [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
        [1, 2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2],
        [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
        [2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2],
        [1, 2, 2, 4, 1, 2, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
        [2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
        [1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
        [2, 1, 2, 1, 1, 5, 1, 2, 2, 1, 2, 2],   /* 1911 */
        [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
        [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
        [2, 2, 1, 2, 5, 1, 2, 1, 2, 1, 1, 2],
        [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
        [2, 3, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
        [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
        [1, 2, 1, 1, 2, 1, 5, 2, 1, 2, 2, 2],
        [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
        [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],   /* 1921 */
        [2, 1, 2, 2, 3, 2, 1, 1, 2, 1, 2, 2],
        [1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
        [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
        [2, 1, 2, 5, 2, 1, 2, 2, 1, 2, 1, 2],
        [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
        [1, 5, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
        [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
        [1, 2, 2, 1, 1, 5, 1, 2, 1, 2, 2, 1],
        [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],   /* 1931 */
        [2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
        [1, 2, 2, 1, 6, 1, 2, 1, 2, 1, 1, 2],
        [1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
        [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 4, 1, 1, 2, 2, 1, 2, 2, 2, 1],
        [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
        [2, 2, 1, 1, 2, 1, 4, 1, 2, 2, 1, 2],
        [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2],
        [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 2, 1, 2, 2, 4, 1, 1, 2, 1, 2, 1],   /* 1941 */
        [2, 1, 2, 2, 1, 2, 2, 1, 1, 2, 1, 2],
        [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
        [2, 1, 2, 4, 1, 2, 1, 2, 2, 1, 2, 2],
        [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
        [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
        [2, 5, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
        [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
        [2, 1, 2, 2, 1, 2, 3, 2, 1, 2, 1, 2],
        [1, 2, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],   /* 1951 */
        [1, 2, 1, 2, 4, 1, 2, 2, 1, 2, 1, 2],
        [1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2, 2],
        [1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
        [2, 1, 4, 1, 1, 2, 1, 2, 1, 2, 2, 2],
        [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
        [2, 1, 2, 1, 2, 1, 1, 5, 2, 1, 2, 2],
        [1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
        [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
        [2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1],
        [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],   /* 1961 */
        [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2, 1],
        [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
        [1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2],
        [1, 2, 5, 2, 1, 1, 2, 1, 1, 2, 2, 1],
        [2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 2, 1, 5, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
        [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
        [1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1, 2],   /* 1971 */
        [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
        [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
        [2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1, 2],
        [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
        [2, 2, 1, 2, 1, 2, 1, 5, 1, 2, 1, 2],
        [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1],
        [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1],
        [2, 1, 1, 2, 1, 6, 1, 2, 2, 1, 2, 1],
        [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
        [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],   /* 1981 */
        [2, 1, 2, 3, 2, 1, 1, 2, 1, 2, 2, 2],
        [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
        [2, 1, 2, 2, 1, 1, 2, 1, 1, 5, 2, 2],
        [1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
        [1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
        [2, 1, 2, 1, 2, 5, 2, 2, 1, 2, 1, 2],
        [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2],
        [1, 2, 1, 1, 5, 1, 2, 2, 1, 2, 2, 2],
        [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],   /* 1991 */
        [1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
        [1, 2, 5, 2, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
        [1, 2, 2, 1, 2, 1, 2, 5, 2, 1, 1, 2],
        [1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 1],
        [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 1, 2, 3, 2, 2, 1, 2, 2, 2, 1],
        [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
        [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
        [2, 2, 1, 5, 2, 1, 1, 2, 1, 2, 1, 2],   /* 2001 */
        [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
        [1, 5, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
        [2, 1, 2, 1, 2, 1, 5, 2, 2, 1, 2, 2],
        [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
        [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
        [2, 2, 1, 1, 5, 1, 2, 1, 2, 1, 2, 2],
        [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
        [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],   /* 2011 */
        [2, 1, 2, 5, 2, 2, 1, 1, 2, 1, 2, 1],
        [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 1, 2, 1, 2, 5, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 1],
        [2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
        [1, 2, 1, 2, 1, 4, 1, 2, 1, 2, 2, 2],
        [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
        [2, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2],
        [2, 1, 2, 5, 2, 1, 1, 2, 1, 2, 1, 2],
        [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],   /* 2021 */
        [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
        [1, 5, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1],
        [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
        [1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
        [2, 2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1],
        [2, 2, 1, 2, 2, 1, 1, 2, 1, 1, 2, 2],
        [1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
        [2, 1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1],   /* 2031 */
        [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 5, 2],
        [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2],
        [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
        [2, 2, 1, 2, 1, 4, 1, 1, 2, 2, 1, 2],
        [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
        [2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
        [2, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 1],
        [2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1],
        [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],   /* 2041 */
        [1, 5, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
        [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
        [2, 1, 2, 1, 1, 2, 3, 2, 1, 2, 2, 2],
        [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
        [2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
        [2, 1, 2, 2, 4, 1, 2, 1, 1, 2, 1, 2],
        [1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1],
        [2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
        [1, 2, 4, 1, 2, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],   /* 2051 */
        [1, 2, 1, 1, 2, 1, 1, 5, 2, 2, 2, 2],
        [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
        [1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
        [1, 2, 2, 1, 2, 4, 1, 1, 2, 1, 2, 1],
        [2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
        [1, 2, 2, 1, 2, 1, 2, 2, 1, 1, 2, 1],
        [2, 1, 2, 4, 2, 1, 2, 1, 2, 2, 1, 1],
        [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 1],
        [2, 2, 3, 2, 1, 1, 2, 1, 2, 2, 2, 1],   /* 2061 */
        [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
        [2, 2, 1, 2, 1, 2, 3, 2, 1, 2, 1, 2],
        [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
        [1, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
        [2, 1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2],
        [1, 2, 1, 5, 1, 2, 1, 2, 2, 2, 1, 2],
        [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
        [2, 1, 2, 1, 2, 1, 1, 5, 2, 1, 2, 2],   /* 2071 */
        [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
        [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 1, 2, 2, 1, 5, 2, 1, 2, 1, 2, 1],
        [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1],
        [2, 1, 2, 3, 2, 1, 2, 2, 2, 1, 2, 1],
        [2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
        [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
        [2, 1, 5, 2, 1, 1, 2, 1, 2, 1, 2, 2],
        [1, 2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2],   /* 2081 */
        [1, 2, 2, 2, 1, 2, 3, 2, 1, 1, 2, 2],
        [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
        [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 1, 6, 1, 2, 2, 1, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
        [1, 2, 1, 5, 1, 2, 1, 1, 2, 2, 2, 1],
        [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
        [2, 2, 2, 1, 2, 1, 1, 5, 1, 2, 2, 1],
        [2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],   /* 2091 */
        [2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
        [1, 2, 2, 1, 2, 4, 2, 1, 2, 1, 2, 1],
        [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
        [2, 1, 2, 3, 2, 1, 1, 2, 2, 2, 1, 2],
        [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
        [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
        [2, 5, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2],
        [2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
        [2, 2, 1, 2, 2, 1, 5, 2, 1, 1, 2, 1]
    ],

    _aHoliday : [
        {sName : "신정", nMonth : 1, nDay : 1, bIsLunar : false, bShowName : true},

        {sName : "설날전날", nMonth : 12, nDay : 0, bIsLunar : true, bShowName : false},
        {sName : '설날', nMonth : 1, nDay : 1, bIsLunar : true, bShowName : true},
        {sName : '설날다음날', nMonth : 1, nDay : 2, bIsLunar : true, bShowName : false},

        {sName : '3·1절', nMonth : 3, nDay : 1, bIsLunar : false, bShowName : true},
        {sName : "식목일", nMonth : 4, nDay : 5, bIsLunar : false, bShowName : true},
        {sName : "석가탄신일", nMonth : 4, nDay : 8, bIsLunar : true, bShowName : true},
        {sName : "어린이날", nMonth : 5, nDay : 5, bIsLunar : false, bShowName : true},
        {sName : "현충일", nMonth : 6, nDay : 6, bIsLunar : false, bShowName : true},
        {sName : "광복절", nMonth : 8, nDay : 15, bIsLunar : false, bShowName : true},

        {sName : "추석전날", nMonth : 8, nDay : 14, bIsLunar : true, bShowName : false},
        {sName : "추석", nMonth : 8, nDay : 15, bIsLunar : true, bShowName : true},
        {sName : "추석다음날", nMonth : 8, nDay : 16, bIsLunar : true, bShowName : false},

        {sName : "개천절", nMonth : 10, nDay : 3, bIsLunar : false, bShowName : true},
        {sName : "한글날", nMonth : 10, nDay : 9, bIsLunar : false, bShowName : true},
        {sName : "성탄절", nMonth : 12, nDay : 25, bIsLunar : false, bShowName : true}
    ],

    _nCurYear : 0,
    _nCurMonth : 0,
    _nCalendarCount : 1,
    _bIsPickStart : true, // true: 시작날짜 선택, false: 끝 날짜 선택
    _bShowEndDateSelector : true, // 체크인 날짜를 선택 후 체크아웃 날짜 선택 창을 열어준다.

    _init : function(htOptions){
        $.extend(this, htOptions);
        this._cacheElement();
        this._setEvent();
        this._setDate();
        this._drawCal();
        this.afterInit(this, this._bIsPickStart, this.aStartDate , this.aEndDate , this._getDays(this.aStartDate, this.aEndDate));
    },

    _setDate : function(){
        this._refreshToday();
        this._nCurYear = this.oNow.getFullYear();
        this._nCurMonth = this.oNow.getMonth() + 1;
        //if(this.aStartDate[0] == 0){
        //    this.aStartDate = this._getYearMonthDay(this.oNow);
        //}
        //
        //if(this.aEndDate[0] == 0){
        //    this._recalEndDate();
        //}
    },

    /**
     * 오늘날짜의 경우 시간이 흘러감에 따라 바뀔수 있기 때문에 계쏙 리프레쉬 해준다.
     * @private
     */
    _refreshToday : function(){
        this.oNow = new Date();
        this.oToday = new Date(this.oNow.getFullYear(), this.oNow.getMonth(), this.oNow.getDate()); // 날짜 비교를 위해 시간을 제거한 한 date object
        this.aToday = [this.oNow.getFullYear(), this.oNow.getMonth() + 1, this.oNow.getDate()];
        this.oSelectableStartDate =  new Date(this.oNow.getFullYear(), this.oNow.getMonth(), this.oNow.getDate() + this.nSelectableStartDayFromToday); // 날짜 비교를 위해 시간을 제거한 한 date object
        if(this._bIsPickStart){
            this.oMaxLimitDate = new Date(this.oNow.getFullYear(), this.oNow.getMonth(), this.oNow.getDate() + this.nMaxAvailableDays - 1); // 오늘부터 X일까지만 선택 가능
        }else{
            this.oMaxLimitDate = new Date(this.oNow.getFullYear(), this.oNow.getMonth(), this.oNow.getDate() + this.nMaxAvailableDays); // 오늘부터 X일까지만 선택 가능
        }
    },

    _cacheElement : function(){
        this._nCalendarCount = this.welCal.length;
        this.wfnHide = $.proxy(this.hide, this);
        this.welBody = $("body");
    },

    _setEvent : function(){
        if(this.bEnableMouseoverAction){
            this.welCal.on("mouseenter", "._active", $.proxy(this._onMouseEnterDay, this));
            this.welCal.on("mouseleave", "._active", $.proxy(this._onMouseLeaveDay, this));
        }

        this.welBtnPrev && this.welBtnPrev.click($.proxy(this._onPrevMonth, this));
        this.welBtnNext && this.welBtnNext.click($.proxy(this._onNextMonth, this));

        // 날짜 클릭시
        this.welCal.on("click", "._active", $.proxy(this._onSelectDay, this));

        this.welLayer.click(function(){return false;});

        this.welBtnClose && this.welBtnClose.on("click", $.proxy(this.hide, this));
    },

    /**
     * 날짜 클릭시 처리
     * @param e
     * @private
     */
    _onSelectDay : function(e){
        var wel = $(e.currentTarget);
        var aDate = wel.attr("data-date").split("-");
        var aDateNumber = [parseInt(aDate[0], 10), parseInt(aDate[1], 10), parseInt(aDate[2], 10)];
        var bValid = true;

        var aOriginalStart = this.aStartDate.slice(0);
        var aOriginalEnd = this.aEndDate.slice(0);

        if(this._bIsPickStart){ // 시작날짜 선택
            this.aStartDate = aDateNumber;
            bValid = this._recalEndDate();
            if(!bValid){
                this.aStartDate = aOriginalStart;
                return;
            }
        }else{ // 끝 날짜 선택
            if(this.bDisableSelectDayBeforeStartDate == true && this._compareDate(this.aStartDate, aDateNumber) == 0){ // 체크아웃 날짜를 체크인 날짜와 같은 날을 선택하였을 경우
                return;
            }

            if(this._compareDate(this.aToday, aDateNumber) == 0){ // 체크 아웃 날짜가 오늘 날짜를 선택 되지 않게 한다.
                return;
            }

            this.aEndDate = aDateNumber;
            bValid = this._recalStartDate();
            if(!bValid){
                this.aEndDate = aOriginalEnd;
                return;
            }
        }

        this._drawCal();
        this.afterSelect(this, this._bIsPickStart, this.aStartDate , this.aEndDate , this._getDays(this.aStartDate, this.aEndDate), this._bShowEndDateSelector);
        this._bShowEndDateSelector = false;
    },

    /**
     * 현재 선택된 날짜가 몇일인지 반환
     */
    getSelectDay : function(){
        return this._getDays(this.aStartDate, this.aEndDate);
    },
    /**
     * 시작 날짜와 도착 날짜가 붙어 있을 경우 마크업으로 처리가 불가능해서 클래스를 추가해 준다.
     * @private
     */
    _addOneDayClass : function(){
        if(!this.sOneDayClass) {
            return;
        }
        var nDays = this._getDays(this.aStartDate, this.aEndDate);
        this.welCal.find("." + this.sOneDayClass).removeClass(this.sOneDayClass);

        if(nDays == 2){
            this.welCal.find("." + this.sStartClass).addClass(this.sOneDayClass);
        }
    },

    /**
     * 선택된 날짜가 총 몇일인지 반환한다.
     * @private
     */
    _getDays : function(aStart, aEnd){
        var oStartDate = new Date(aStart[0], aStart[1] - 1, aStart[2]);
        var oEndDate = new Date(aEnd[0], aEnd[1] - 1, aEnd[2]);
        var nOneDay = 24 * 60 * 60 * 1000;

        return Math.round(Math.abs( (oEndDate.getTime() - oStartDate.getTime()) / nOneDay )) + 1;
    },

    /**
     * 시작날짜가 변경될 경우, 끝 날짜와 갭을 다시 계산한다.
     */
    _recalEndDate : function(){
        var nCompare = this._compareDate(this.aStartDate, this.aEndDate);
        this._refreshToday();

        if(nCompare == 0 || nCompare == 1){ // 시작 날짜가 끝날짜와 같거나 이후인 경우
            var oDate = new Date(this.aStartDate[0], this.aStartDate[1] - 1, this.aStartDate[2] + this.nStartNEndDateGap);

            if(oDate.getTime() > this.oMaxLimitDate.getTime()){ // 최대 선택 날짜를 초과 한경우
                this.aEndDate = this._getYearMonthDay(this.oMaxLimitDate);
            }else{
                this.aEndDate = this._getYearMonthDay(oDate);
            }
            this._bShowEndDateSelector = true;
        }else{
            if(this._getDays(this.aStartDate, this.aEndDate) > this.nMaxReservableDays){ // 최대 예약 가능한 날짜를 넘은 경우 체크아웃 날짜를 당긴다.
                var oDate = new Date(this.aStartDate[0], this.aStartDate[1] - 1, this.aStartDate[2] + this.nMaxReservableDays);
                this.aEndDate = this._getYearMonthDay(oDate);
                this._bShowEndDateSelector = true;
            }
        }

        return true;
    },

    /**
     * 끝날짜가 변경될 경우, 시작 날짜와 갭을 다시 계산한다.
     */
    _recalStartDate : function(){
        // 시작 날짜 선택이 안된 경우
        if(this.aStartDate[0] == 0){
            var oDate = new Date(this.aEndDate[0], this.aEndDate[1] - 1, this.aEndDate[2] - this.nStartNEndDateGap);
            if(oDate < this.oSelectableStartDate.getTime()){
                this.aStartDate = this._getYearMonthDay(this.oSelectableStartDate);
            }else{
                this.aStartDate = this._getYearMonthDay(oDate);
            }
            return true;
        }

        var nCompare = this._compareDate(this.aStartDate, this.aEndDate);
        this._refreshToday();

        if(nCompare == 0 || nCompare == 1){
            var oDate = new Date(this.aEndDate[0], this.aEndDate[1] - 1, this.aEndDate[2] - this.nStartNEndDateGap);
            if(oDate.getTime() < this.oSelectableStartDate.getTime()){ // 선택가능한 이전 날짜의 경우
                this.aStartDate = this._getYearMonthDay(this.oSelectableStartDate);
            }else{
                this.aStartDate = this._getYearMonthDay(oDate);
            }
        }else{
            if(this._getDays(this.aStartDate, this.aEndDate) > this.nMaxReservableDays){
                var oDate = new Date(this.aEndDate[0], this.aEndDate[1] - 1, this.aEndDate[2] - this.nMaxReservableDays);
                this.aStartDate = this._getYearMonthDay(oDate);
            }
        }
        return true;
    },

    /**
     * date오브젝트에서 년, 월, 일을 반환
     * @param oDate date Object
     * @returns {*[]}
     * @private
     */
    _getYearMonthDay : function(oDate){
        return [oDate.getFullYear(), oDate.getMonth()+1, oDate.getDate()]
    },

    /**
     * 배열로 넘겨준 날짜 비교
     * @param aDate1 [년,월,일]
     * @param aDate2 [년,월,일]
     * @returns {number} 0 : 같음, 1: aDate1이 큼(이후날짜), 2 : aDate2가 큼(이후 날짜)
     * @private
     */
    _compareDate : function(aDate1, aDate2){
        var oDate1 = new Date(aDate1[0], aDate1[1] - 1, aDate1[2]);
        var oDate2 = new Date(aDate2[0], aDate2[1] - 1, aDate2[2]);

        if(oDate1.getTime() > oDate2.getTime()){
            return 1;
        }else if(oDate1.getTime() == oDate2.getTime()){
            return 0
        }else{
            return 2;
        }
    },

    _onMouseEnterDay : function(e){
        var wel = $(e.currentTarget);

        if(this._bIsPickStart){
            this.aMOstart = wel.attr("data-date").split("-");
            this.aMOend = this.aEndDate;
        }else{
            this.aMOstart = this.aStartDate;
            this.aMOend = wel.attr("data-date").split("-");
        }

        this._drawMouseover(this.aMOstart, this.aMOend);
    },

    _onMouseLeaveDay : function(){
        this._drawMouseover(this.aStartDate, this.aEndDate);
    },

    _drawMouseover : function(aStart, aEnd){
        var oStartDate = new Date(aStart[0], aStart[1] - 1, aStart[2]);
        var oEndDate = new Date(aEnd[0], aEnd[1] - 1, aEnd[2]);
        this.welCal.find("._active").removeClass(this.sStartClass + " " + this.sBetweenClass  + " " + this.sEndClass);

        // end날짜가 start날짜와 같거나 보다 더 이전인경우
        if(oStartDate.getTime() >= oEndDate.getTime()){
            if(this._bIsPickStart) {
                this.welCal.find("._active[data-date=" + aStart.join("-") + "]").addClass(this.sStartClass);
                this.onAfterHover(this, this._bIsPickStart, aStart, aStart, 1);
            }else{
                this.welCal.find("._active[data-date="+aEnd.join("-")+"]").addClass(this.sEndClass);
                this.onAfterHover(this, this._bIsPickStart, aEnd, aEnd, 1);
            }
            return;
        }

        this.welCal.find("._active[data-date="+aStart.join("-")+"]").addClass(this.sStartClass); // 시작 클래스 추가
        this.welCal.find("._active[data-date="+aEnd.join("-")+"]").addClass(this.sEndClass); // 끝 클래스 추가

        for(var i = 1; i<100; i++){ // 시작과 끝 중간 날짜에 클래스 추가
            var oCurDate = new Date(aStart[0], aStart[1] - 1, parseInt(aStart[2], 10) + i);

            if(oCurDate.getTime() >= oEndDate){
                break;
            }

            var sCurDate = oCurDate.getFullYear() + "-" + (oCurDate.getMonth()+1) + "-" + oCurDate.getDate();
            this.welCal.find("._active[data-date="+sCurDate+"]").addClass(this.sBetweenClass);
        }

        var nDays = this._getDays(aStart, aEnd); // 선택한 일수
        this.onAfterHover(this, this._bIsPickStart, aStart, aEnd, nDays, nDays-1 > this.nMaxReservableDays);
    },

    _onPrevMonth : function(){
        var oDate = new Date(this._nCurYear, this._nCurMonth - (2 + this._nCalendarCount - 1));
        this._nCurYear = oDate.getFullYear();
        this._nCurMonth = oDate.getMonth() + 1;
        this._drawCal();
    },

    _onNextMonth : function(){
        var oDate = new Date(this._nCurYear, this._nCurMonth + (this._nCalendarCount - 1));
        this._nCurYear = oDate.getFullYear();
        this._nCurMonth = oDate.getMonth() + 1;
        this._drawCal();
    },

    setCurrentDisplayYearMonth : function(nYear, nMonth){
        if(nYear == 0 || nMonth == 0){
            return;
        }

        this._nCurYear = nYear;
        this._nCurMonth = nMonth;
    },

    _drawCal : function(){
        for(var i = 0, max = this.welCal.length ; i < max ; i++){
            var oDate = new Date(this._nCurYear, this._nCurMonth + (i-1));
            var nDrawYear = oDate.getFullYear();
            var nDrawMonth = oDate.getMonth() + 1;
            this._draw(this.welCal.eq(i), nDrawYear, nDrawMonth);
        }
        this._addOneDayClass();
    },


    _draw : function(wel, nYear, nMonth){
        var aMonthDay = this._getDayCountOfMonth(nYear);
        this._setLunarNewYearHoliday(nYear); // 설날 전날 날짜 계산하여 셋팅

        this._refreshToday();
        var oDate = new Date(nYear, nMonth - 1, 1);
        var nStartWeekday = oDate.getDay();
        var welDay = wel.find(this.sDayCellSeletor); // Day Cells
        var welDayText = welDay.find(this.sDayTextSelector); // 날짜 숫자가 들어갈 엘리먼트

        // 년월 표시
        wel.find("." + this.sDisplayYearMonthClass).html(nYear + "-" + (nMonth <= 9 ? "0" : "") + nMonth);

        // Reset day cells
        welDayText.html("");
        welDay.attr("class", "");

        var oStartDate = new Date(this.aStartDate[0], this.aStartDate[1] - 1, this.aStartDate[2]);
        var oEndDate = new Date(this.aEndDate[0], this.aEndDate[1] - 1, this.aEndDate[2]);
        var oReverableDate =  new Date(this.aStartDate[0], this.aStartDate[1] - 1, this.aStartDate[2] + this.nMaxReservableDays);

        // Fill day cells
        for(var i = 0; i < aMonthDay[nMonth - 1]; i++) {
            var nIndex = nStartWeekday + i;
            var welCurDay = welDay.eq(nIndex);
            var htSolarDate = {
                nYear: nYear,
                nMonth: nMonth,
                nDay: i + 1
            };
            var oCurDate = new Date(nYear, nMonth - 1, i + 1);
            var htLunarDate = this._lunarCalc(nYear, nMonth, i + 1, 1);
            var htHoliday = this._checkHoliday(htSolarDate, htLunarDate);

            // 날짜 채우기
            welCurDay.find(this.sDayTextSelector).html(i + 1);

            // Cell에 날짜를 입력해 둔다.
            welCurDay.attr("data-date", htSolarDate.nYear + "-" + htSolarDate.nMonth + "-" + htSolarDate.nDay);
            if (this.sDisabledClass && oCurDate.getTime() < this.oSelectableStartDate.getTime() ||
                oCurDate.getTime() > this.oMaxLimitDate.getTime()) {             // 오늘 이전 날짜 또는 최대입력 날짜 이상일 경우  disable
                welCurDay.addClass(this.sDisabledClass);
            }else if(this.bDisableSelectDayBeforeStartDate == true && this._bIsPickStart == false && oCurDate.getTime() < oStartDate.getTime()){ // 체크아웃 날짜 선택시, 선택된 시작 날짜 이전 날짜는 disable 시킨다.
                welCurDay.addClass(this.sDisabledClass);
            }else if(this.bDisableOverMaxReservableDays == true && this._bIsPickStart == false && oCurDate.getTime() > oReverableDate.getTime()){ //시작 날짜로부터 최대 예약 가능 일자까지만 선택 가능하게
                welCurDay.addClass(this.sDisabledClass);
            }else{
                welCurDay.addClass("_active"); // active 클래스 추가 -> 날짜가 있는 element 라고 표시 -> mouseover에 쓰임
            }

            // 토요일
            if(nIndex % 7 == 6){
                welCurDay.addClass(this.sSaturdayClass);
            }

            // 일요일
            if(nIndex % 7 == 0){
                welCurDay.addClass(this.sSundayClass);
            }

            // 공휴일
            if(htHoliday){
                welCurDay.addClass(this.sHolidayClass);
                welCurDay.attr("title", htHoliday.sName);
            }


            // 오늘날짜인 경우
            if(this.sTodayClass && oCurDate.getTime() == this.oToday.getTime()){
                welCurDay.addClass(this.sTodayClass);
            }

            // 시작 날짜가 셋팅이 안된 경우 날짜 표시 하지 않음
            if(this.aStartDate[0] != 0){
                if(oCurDate.getTime() == oStartDate.getTime()){ // 시작 날짜인 경우
                    welCurDay.addClass(this.sStartClass);
                }else if(oCurDate.getTime() == oEndDate.getTime()){ // 끝 날짜인 경우
                    welCurDay.addClass(this.sEndClass);
                }else if(oCurDate.getTime() > oStartDate.getTime() && oCurDate.getTime() < oEndDate.getTime()){ // 중간 날짜인 경우
                    welCurDay.addClass(this.sBetweenClass);
                }

            }

        }
    },

    /**
     * 각 달의 일수를 리턴한다.
     * @private
     */
    _getDayCountOfMonth : function(nYear){
        var aMonthDay = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        /* set monthDay of Feb */
        if(nYear % 400 == 0){
            aMonthDay[1] = 29;
        }else if(nYear % 100 == 0){
            aMonthDay[1] = 28;
        }else if(nYear % 4 == 0){
            aMonthDay[1] = 29;
        }else{
            aMonthDay[1] = 28;
        }

        return aMonthDay;
    },

    /**
     * 설날 전날 날짜 셋팅
     * @private
     */
    _setLunarNewYearHoliday : function(nYear){
        var nDay = 0;
        /* set the nDay before 설날 */
        if(this._getLunarMonth(nYear, 12) == 1){
            nDay = 29;
        }else if(this._getLunarMonth(nYear, 12) == 2){
            nDay = 30;
        }else{
            return;
        }

        for(var i= 0, max=this._aHoliday.length; i<max; i++){
            if(this._aHoliday[i].sName == "설날전날"){
                this._aHoliday[i].nDay = nDay;
            }
        }
    },

    _getLunarMonth : function(nYear, nMonth){
        return this._aLunarMonthTable[nYear - 1 - 1799][nMonth - 1];
    },

    _checkHoliday : function(htSolarDate, htLunarDate){
        for(var i = 0; i < this._aHoliday.length; i++)
        {
            if(this._aHoliday[i].nMonth == htSolarDate.nMonth &&
                this._aHoliday[i].nDay == htSolarDate.nDay &&
                this._aHoliday[i].bIsLunar == false){
                return this._aHoliday[i];
            }

            //윤달의 공휴일 처리에 대한 예외처리
            if(htLunarDate.nLeapMonth && htLunarDate.nMonth == 4 && htLunarDate.nDay == 8){
                return null;
            }
            if(htLunarDate.nLeapMonth && htLunarDate.nMonth == 8 && htLunarDate.nDay > 13 && htLunarDate.nDay < 17){
                return null;
            }

            if(this._aHoliday[i].nMonth == htLunarDate.nMonth &&
                this._aHoliday[i].nDay == htLunarDate.nDay &&
                this._aHoliday[i].bIsLunar == true){
                return this._aHoliday[i];
            }
        }


        return null;
    },

    /* 양력 <-> 음력 변환 함수
     * nType : 1 - 양력 -> 음력
     *        2 - 음력 -> 양력
     * nLeapmonth : 0 - 평달
     *             1 - 윤달 (nType = 2 일때만 유효)
     */
    _lunarCalc : function(nYear, nMonth, nDay, nType, nLeapmonth){
        var nSolYear, nSolMonth, nSolDay;
        var nLunYear, nLunMonth, nLunDay;
        var nLunLeapMonth, nLunMonthDay;
        var nLunIndex;

        var aSolMonthDay = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        /* range check */
        if (nYear < 1800 || nYear > 2101)
        {
            alert('1800년부터 2101년까지만 지원합니다');
            return;
        }

        /* 속도 개선을 위해 기준 일자를 여러개로 한다 */
        if(nYear >= 2080){
            /* 기준일자 양력 2080년 1월 1일 (음력 2079년 12월 10일) */
            nSolYear = 2080;
            nSolMonth = 1;
            nSolDay = 1;
            nLunYear = 2079;
            nLunMonth = 12;
            nLunDay = 10;
            nLunLeapMonth = 0;

            aSolMonthDay[1] = 29; /* 2080 년 2월 28일 */
            nLunMonthDay = 30; /* 2079년 12월 */
        }else if (nYear >= 2060){
            /* 기준일자 양력 2060년 1월 1일 (음력 2059년 11월 28일) */
            nSolYear = 2060;
            nSolMonth = 1;
            nSolDay = 1;
            nLunYear = 2059;
            nLunMonth = 11;
            nLunDay = 28;
            nLunLeapMonth = 0;

            aSolMonthDay[1] = 29; /* 2060 년 2월 28일 */
            nLunMonthDay = 30; /* 2059년 11월 */
        }else if (nYear >= 2040){
            /* 기준일자 양력 2040년 1월 1일 (음력 2039년 11월 17일) */
            nSolYear = 2040;
            nSolMonth = 1;
            nSolDay = 1;
            nLunYear = 2039;
            nLunMonth = 11;
            nLunDay = 17;
            nLunLeapMonth = 0;

            aSolMonthDay[1] = 29; /* 2040 년 2월 28일 */
            nLunMonthDay = 29; /* 2039년 11월 */
        }else if (nYear >= 2020){
            /* 기준일자 양력 2020년 1월 1일 (음력 2019년 12월 7일) */
            nSolYear = 2020;
            nSolMonth = 1;
            nSolDay = 1;
            nLunYear = 2019;
            nLunMonth = 12;
            nLunDay = 7;
            nLunLeapMonth = 0;

            aSolMonthDay[1] = 29; /* 2020 년 2월 28일 */
            nLunMonthDay = 30; /* 2019년 12월 */
        }else if (nYear >= 2000){
            /* 기준일자 양력 2000년 1월 1일 (음력 1999년 11월 25일) */
            nSolYear = 2000;
            nSolMonth = 1;
            nSolDay = 1;
            nLunYear = 1999;
            nLunMonth = 11;
            nLunDay = 25;
            nLunLeapMonth = 0;

            aSolMonthDay[1] = 29; /* 2000 년 2월 28일 */
            nLunMonthDay = 30; /* 1999년 11월 */
        }else if (nYear >= 1980){
            /* 기준일자 양력 1980년 1월 1일 (음력 1979년 11월 14일) */
            nSolYear = 1980;
            nSolMonth = 1;
            nSolDay = 1;
            nLunYear = 1979;
            nLunMonth = 11;
            nLunDay = 14;
            nLunLeapMonth = 0;

            aSolMonthDay[1] = 29; /* 1980 년 2월 28일 */
            nLunMonthDay = 30; /* 1979년 11월 */
        }else if (nYear >= 1960){
            /* 기준일자 양력 1960년 1월 1일 (음력 1959년 12월 3일) */
            nSolYear = 1960;
            nSolMonth = 1;
            nSolDay = 1;
            nLunYear = 1959;
            nLunMonth = 12;
            nLunDay = 3;
            nLunLeapMonth = 0;

            aSolMonthDay[1] = 29; /* 1960 년 2월 28일 */
            nLunMonthDay = 29; /* 1959년 12월 */
        }else if (nYear >= 1940){
            /* 기준일자 양력 1940년 1월 1일 (음력 1939년 11월 22일) */
            nSolYear = 1940;
            nSolMonth = 1;
            nSolDay = 1;
            nLunYear = 1939;
            nLunMonth = 11;
            nLunDay = 22;
            nLunLeapMonth = 0;

            aSolMonthDay[1] = 29; /* 1940 년 2월 28일 */
            nLunMonthDay = 29; /* 1939년 11월 */
        }else if (nYear >= 1920){
            /* 기준일자 양력 1920년 1월 1일 (음력 1919년 11월 11일) */
            nSolYear = 1920;
            nSolMonth = 1;
            nSolDay = 1;
            nLunYear = 1919;
            nLunMonth = 11;
            nLunDay = 11;
            nLunLeapMonth = 0;

            aSolMonthDay[1] = 29; /* 1920 년 2월 28일 */
            nLunMonthDay = 30; /* 1919년 11월 */
        }else if (nYear >= 1900){
            /* 기준일자 양력 1900년 1월 1일 (음력 1899년 12월 1일) */
            nSolYear = 1900;
            nSolMonth = 1;
            nSolDay = 1;
            nLunYear = 1899;
            nLunMonth = 12;
            nLunDay = 1;
            nLunLeapMonth = 0;


            aSolMonthDay[1] = 28; /* 1900 년 2월 28일 */
            nLunMonthDay = 30; /* 1899년 12월 */
        }else if (nYear >= 1880){
            /* 기준일자 양력 1880년 1월 1일 (음력 1879년 11월 20일) */
            nSolYear = 1880;
            nSolMonth = 1;
            nSolDay = 1;
            nLunYear = 1879;
            nLunMonth = 11;
            nLunDay = 20;
            nLunLeapMonth = 0;

            aSolMonthDay[1] = 29; /* 1880 년 2월 28일 */
            nLunMonthDay = 30; /* 1879년 11월 */
        }else if (nYear >= 1860){
            /* 기준일자 양력 1860년 1월 1일 (음력 1859년 12월 9일) */
            nSolYear = 1860;
            nSolMonth = 1;
            nSolDay = 1;
            nLunYear = 1859;
            nLunMonth = 12;
            nLunDay = 9;
            nLunLeapMonth = 0;

            aSolMonthDay[1] = 29; /* 1860 년 2월 28일 */
            nLunMonthDay = 30; /* 1859년 12월 */
        }else if (nYear >= 1840){
            /* 기준일자 양력 1840년 1월 1일 (음력 1839년 11월 27일) */
            nSolYear = 1840;
            nSolMonth = 1;
            nSolDay = 1;
            nLunYear = 1839;
            nLunMonth = 11;
            nLunDay = 27;
            nLunLeapMonth = 0;

            aSolMonthDay[1] = 29; /* 1840 년 2월 28일 */
            nLunMonthDay = 30; /* 1839년 11월 */
        }else if (nYear >= 1820){
            /* 기준일자 양력 1820년 1월 1일 (음력 1819년 11월 16일) */
            nSolYear = 1820;
            nSolMonth = 1;
            nSolDay = 1;
            nLunYear = 1819;
            nLunMonth = 11;
            nLunDay = 16;
            nLunLeapMonth = 0;

            aSolMonthDay[1] = 29; /* 1820 년 2월 28일 */
            nLunMonthDay = 30; /* 1819년 11월 */
        }else if (nYear >= 1800){
            /* 기준일자 양력 1800년 1월 1일 (음력 1799년 12월 7일) */
            nSolYear = 1800;
            nSolMonth = 1;
            nSolDay = 1;
            nLunYear = 1799;
            nLunMonth = 12;
            nLunDay = 7;
            nLunLeapMonth = 0;

            aSolMonthDay[1] = 28; /* 1800 년 2월 28일 */
            nLunMonthDay = 30; /* 1799년 12월 */
        }

        nLunIndex = nLunYear - 1799;

        while (true)
        {
            if (nType == 1 && nYear == nSolYear && nMonth == nSolMonth && nDay == nSolDay){ // 양력 => 음력 변환
                return {nYear : nLunYear, nMonth : nLunMonth, nDay : nLunDay, nLeapMonth : nLunLeapMonth};
            }else if (nType == 2 && nYear == nLunYear && nMonth == nLunMonth && nDay == nLunDay && nLeapmonth == nLunLeapMonth){ // 음력 => 양력 변환
                return {nYear : nSolYear, nMonth : nSolMonth, nDay : nSolDay, nLeapMonth : 0};
            }

            /* add a nDay of solar calendar */
            if (nSolMonth == 12 && nSolDay == 31){
                nSolYear++;
                nSolMonth = 1;
                nSolDay = 1;

                /* set monthDay of Feb */
                if (nSolYear % 400 == 0){
                    aSolMonthDay[1] = 29;

                }else if (nSolYear % 100 == 0){
                    aSolMonthDay[1] = 28;
                }else if (nSolYear % 4 == 0){
                    aSolMonthDay[1] = 29;
                }else{
                    aSolMonthDay[1] = 28;
                }

            }else if (aSolMonthDay[nSolMonth - 1] == nSolDay){
                nSolMonth++;
                nSolDay = 1;
            }else{
                nSolDay++;
            }


            /* add a day of lunar calendar */
            if (nLunMonth == 12 &&
                ((this._aLunarMonthTable[nLunIndex][nLunMonth - 1] == 1 && nLunDay == 29) ||
                (this._aLunarMonthTable[nLunIndex][nLunMonth - 1] == 2 && nLunDay == 30))){
                nLunYear++;
                nLunMonth = 1;
                nLunDay = 1;

                if (nLunYear > 2101) {
                    alert("입력하신 날 또는 달은 없습니다. 다시 입력하시기 바랍니다.");
                    break;
                }

                nLunIndex = nLunYear - 1799;

                if(this._aLunarMonthTable[nLunIndex][nLunMonth - 1] == 1){
                    nLunMonthDay = 29;
                }else if(this._aLunarMonthTable[nLunIndex][nLunMonth - 1] == 2){
                    nLunMonthDay = 30;
                }
            }else if(nLunDay == nLunMonthDay){
                if(this._aLunarMonthTable[nLunIndex][nLunMonth - 1] >= 3
                    && nLunLeapMonth == 0){
                    nLunDay = 1;
                    nLunLeapMonth = 1;
                }else{
                    nLunMonth++;
                    nLunDay = 1;
                    nLunLeapMonth = 0;
                }


                if (this._aLunarMonthTable[nLunIndex][nLunMonth - 1] == 1){
                    nLunMonthDay = 29;
                }else if (this._aLunarMonthTable[nLunIndex][nLunMonth - 1] == 2){
                    nLunMonthDay = 30;
                }else if (this._aLunarMonthTable[nLunIndex][nLunMonth - 1] == 3){
                    nLunMonthDay = 29;
                }else if (this._aLunarMonthTable[nLunIndex][nLunMonth - 1] == 4 && nLunLeapMonth == 0){
                    nLunMonthDay = 29;
                }else if (this._aLunarMonthTable[nLunIndex][nLunMonth - 1] == 4 && nLunLeapMonth == 1)
                    nLunMonthDay = 30;
                else if (this._aLunarMonthTable[nLunIndex][nLunMonth - 1] == 5 && nLunLeapMonth == 0){
                    nLunMonthDay = 30;
                }else if (this._aLunarMonthTable[nLunIndex][nLunMonth - 1] == 5 && nLunLeapMonth == 1){
                    nLunMonthDay = 29;
                }else if (this._aLunarMonthTable[nLunIndex][nLunMonth - 1] == 6){
                    nLunMonthDay = 30;
                }
            }else{
                nLunDay++;
            }
        }
    },

    /**
     *
     * @param bShowCheckInDateInDisplay true : 체크인 날짜의 달력이 왼쪽 달력에 나타나게
     */
    show : function(bShowCheckInDateInDisplay){
        if(bShowCheckInDateInDisplay){
            this.setCurrentDisplayYearMonth(this.aStartDate[0], this.aStartDate[1]);
        }
        this._drawCal();
        this.welLayer.show();
        this.welBody.bind("click", this.wfnHide);
    },

    hide : function(){
        this.welLayer.hide();
        this.welBody.unbind("click", this.wfnHide);
    },

    setPickStart : function(){
        this._bIsPickStart = true;
    },

    setPickEnd : function(){
        this._bIsPickStart = false;
    },

    /**
     * UI 표기 데이터 포멧을 위한 포멧 컨버터
     * @private
     */
    convertDateFormat : function( aConvertDate ){
        var result = [];

        result.push(aConvertDate[0]);
        result.push((aConvertDate[1].length > 1 || aConvertDate[1] > 9)? aConvertDate[1] : '0'+aConvertDate[1]);
        result.push((aConvertDate[2].length > 1 || aConvertDate[2] > 9)? aConvertDate[2] : '0'+aConvertDate[2]);

        return result;
    }
};
