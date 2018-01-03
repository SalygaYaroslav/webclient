/**
 *
 * @param to
 * @param from
 * @param text
 * @param time
 * @param type
 * @param read
 * @returns {{to: *, from: *, text: *, time: *, format_time: (*|{id, title, icon, active, show, click}|{sameDay, nextDay, lastDay, nextWeek, lastWeek, sameElse}|{sameDay, nextDay, nextWeek, lastDay, lastWeek, sameElse}), type: *, unread: boolean}}
 * @constructor
 */
Chat.Message = function (id, to, from, text, time, type, read) {
    return {
        id: id,
        to: to,
        from: from,
        text: text,
        time: time,
        format_time: moment(time).calendar(),
        type: type,
        unread: (typeof read == 'undefined' ? true : !read)
    };
};