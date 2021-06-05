import { TransformNode } from "@babylonjs/core";
import { BabylonNode, FiberTransformNodeProps, FiberTransformNodePropsCtor } from "react-babylonjs";

export type TransformNodeProps = FiberTransformNodeProps & FiberTransformNodePropsCtor & BabylonNode<TransformNode>