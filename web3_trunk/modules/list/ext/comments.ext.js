/**
 * список комментов
 * @param task_id
 * @param format_comment
 * @returns {{load: load, getListComments: getListComments}}
 * @constructor
 */
List.Comments = function (task_id, format_comment) {
    /** private */
    let local = {
        task_id: null,
        task: null,
        format_comment: null,
        last_comment_id: 0,
        max_oper_id: 0,
        max_comment_id: 0,
        max_count: 20,
        has_more_items: true,
        comments: [],
        likes: {},
        load_now: false
    };
    let parseXmlComment = function (item) {
        let json = Tool.xmlToJson(item);
        let comment = new Comment(json, local.likes[json.id]);
        /** last comment */
        local.last_comment_id = comment.getId();
        let oper_id = comment.getOperId();
        if (parseInt(oper_id) > parseInt(local.max_oper_id)) {
            local.max_oper_id = parseInt(oper_id);
            local.max_comment_id = parseInt(local.last_comment_id);
        }
        return comment;
    };
    /**
     * загрузка с сервера
     * @param callback
     * @returns {*}
     */
    let loadFromServer = function (callback) {
        if (local.load_now == true) {
            return callback(false);
        }
        let comments = [];
        local.load_now = true;
        Request.getCommentsByTaskId(task_id, local.last_comment_id, local.max_count, function (request_data) {
            local.load_now = false;
            let xml = request_data.xml();
            $('comments > comment', xml).each(function (i, item) {
                let comment = parseXmlComment(item);
                /** push comment */
                comments.push(comment);
            });
            /** проверим, можно ли еще загрузить */
            let load_more = $('tasks > parsed', xml).text();
            if (/\*$/.test(load_more.toString()) == false) {
                local.has_more_items = false;
            }
            local.comments = local.comments.concat(comments);
            callback(comments);
        });
    };
    let parseVote = function (item) {
        let vote = Tool.xmlToJson(item);
        if (typeof local.likes[vote['comment_id']] == 'undefined') {
            local.likes[vote['comment_id']] = {};
        }
        local.likes[vote['comment_id']][vote['id']] = vote;
        return vote;
    };
    /**
     * загрузка лайков
     */
    let loadLikes = function () {
        let data = Request.getTaskLikes(local.task_id);
        let xml = data.xml();
        $('comvotes > comvote', xml).each(function (i, item) {
            parseVote(item);
        });
    };
    /** constructor */
    local.task_id = task_id;
    local.task = Dataset.get('task',task_id);
    local.format_comment = format_comment || function (object) {
            return object;
        };
    loadLikes();
    /** public */
    return {
        /**
         * подгрузка комментов
         * @param before
         * @param callback
         * @returns {boolean}
         */
        load: function (before, callback) {
            if (typeof callback == 'undefined') {
                callback = function (data) {
                    return data;
                }
            }
            if (local.has_more_items == true) {
                if (typeof before == 'function') {
                    before();
                }
                return loadFromServer(callback);
            } else {
                return callback([]);
            }
        },
        appendComment: function (json) {
            let comment = new Comment(json, {});
            /** last oper **/
            let oper_id = comment.getOperId();
            if (parseInt(oper_id) > parseInt(local.max_oper_id)) {
                local.max_oper_id = parseInt(oper_id);
                local.max_comment_id = parseInt(local.last_comment_id);
            }
            /** push comment */
            local.comments.push(comment);
            return comment;
        },
        getCommentById: function (id) {
            for (let i = 0; i < local.comments.length; i++) {
                if (local.comments[i].getId() == id) {
                    return local.comments[i];
                }
            }
            return false;
        },
        addLike: function (vote_xml) {
            let vote = parseVote(vote_xml);
            let id = vote.comment_id;
            let comment = this.getCommentById(id);
            if (comment) {
                comment.setLikes(local.likes[id]);
                return comment;
            } else {
                return null;
            }
        },
        /**
         * получим список коментов
         * @returns {Array}
         */
        getListComments: function () {
            return local.comments;
        },
        needUpdate: function (callback) {
            let comments = [];
            Request.checkCommentsUpdate(local.task_id, local.max_oper_id, function (req) {
                let xml = req.xml();
                $('comments > comment', xml).each(function (i, item) {
                    let comment = parseXmlComment(item);
                    /** push comment */
                    comments.push(comment);
                });
                local.comments = local.comments.concat(comments);
                callback(comments);
            });
        }
    }
};