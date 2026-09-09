"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listApartments = listApartments;
exports.postApartment = postApartment;
exports.putApartment = putApartment;
const apartmentService_1 = require("../services/apartmentService");
async function listApartments(req, res) {
    const apartments = await (0, apartmentService_1.listApartmentsForUser)(req.user);
    res.status(200).json({ apartments });
}
async function postApartment(req, res) {
    const apartment = await (0, apartmentService_1.createApartment)({ actorUserId: req.user.id, ...req.body });
    res.status(201).json({ apartment });
}
async function putApartment(req, res) {
    const apartment = await (0, apartmentService_1.updateApartment)({ id: req.params.id, actorUserId: req.user.id, ...req.body });
    res.status(200).json({ apartment });
}
